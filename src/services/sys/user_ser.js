/**
 * Created by JetBrains WebStorm.
 * User: nemo
 * Date: 12-3-28
 * Time: 下午8:17
 * To change this template use File | Settings | File Templates.
 */
var crypto = require('crypto');
var User = require('../../models/sys/user_mod');
var config = require('../../../resources/config');
var mailSer = require('./mail_ser');

exports.signUp  = function(req, res, user) {
  User.find({ '$or': [{'name': req.body.name}, {'email': req.body.email}] }, function(err, users) {
    if (err) {
      req.pushMsg('error', '注册错误，请重试！');
      return res.redirect('home');
    }
    if (users.length > 0) {
      req.pushMsg('error', '昵称或邮箱已被占用！');
      return res.redirect('home');
    }

    user.password = md5(user.password);
    user.is_active = false;
    user.save(function(err) {
      if (err) {
        req.pushMsg('error', '注册错误，请重试！');
        return res.redirect('home');
      }
      mailSer.sendActiveMail(user.email, md5(user.email + config.system.session_secret),
        function(err, success) {
          if (success) {
            gen_session(user, res);
            req.pushMsg('success', '这位卵崽，欢迎入伙！已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号！');
            res.redirect('/match');
          }
        });
    });
  });
};

exports.activeUser = function(req, res, userMod) {
  var key = req.query.key;
  var email = userMod.email;
  User.findOne({ 'email': email }, function(err, user) {
    if (!user || md5(email + config.system.session_secret) != key) {
      req.pushMsg('error', '信息有误，帐号无法被激活！');
      return res.redirect('home');
    }
    if (user.is_active) {
      req.pushMsg('info', '帐号已经被激活过！');
      gen_session(user, res);
      res.redirect('/match');
    }
    user.is_active = true;
    user.save(function(err) {
      if (err) {
        req.pushMsg('error', '激活错误，请重试！');
        return res.redirect('home');
      }
      req.pushMsg('success', '已成功激活您的帐号，您将能使用更多功能，Enjoy it！');
      gen_session(user, res);
      res.redirect('/match');
    });
  });
};

exports.signIn  = function(req, res, userMod) {
  var email = userMod.email;
  var pass = req.body.password.toString().trim();
  User.findOne({ 'email': email }, function(err, user) {
    if (err) {
      req.pushMsg('error', '登录错误，请重试！');
      return res.redirect('home');
    }
    if (!user) {
      req.pushMsg('error', '该用户不存在！');
      return res.redirect('home');
    }
    pass = md5(pass);
    if (pass !== user.password) {
      req.pushMsg('error', '密码错误，请重新输入！');
      return res.redirect('home');
    }
    if (!user.is_active) {
      req.pushMsg('info', '此帐号还未激活，只具备浏览权限，请尽快到注册邮箱中通过我们为您发的邮件进行激活，以获得更多功能的使用权限！');
    }
    // store session cookie
    if (req.body.remember) {
      gen_cookie(user, res);
    }
    req.session.cookie.expires = false;
    req.session.user = user;
    if (config.system.admins[req.session.user.name]) {
      req.session.user.is_admin = true;
    }
    res.local('current_user', req.session.user);

    res.redirect('/match');
  });
};

exports.signAuth = function(req, res, next) {
  if (req.session.user) {
    res.local('current_user', req.session.user);
    return next();
  } else {
    var cookie = req.cookies[config.system.auth_cookie_name];
    if (!cookie) {
      req.pushMsg('info', '本功能需要登录后操作！');
      if (req.path !== '/') {
        return res.redirect('home');
      } else {
        return next();
      }
    }

    var authToken = decrypt(cookie, config.system.session_secret);
    var auth = authToken.split('\t');
    var userId = auth[0];
    User.findOne({ _id: userId }, function(err, user) {
      if (err) return next(err);
      if (user) {
        if(config.system.admins[user.name]){
          user.is_admin = true;
        }
        user.password = '';
        req.session.user = user;
        res.local('current_user', req.session.user);
        return next();
      } else {
        return next();
      }
    });
  }
};
// private
function md5(str) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(str);
  str = md5sum.digest('hex');
  return str;
}
function encrypt(str, secret) {
  var cipher = crypto.createCipher('aes192', secret);
  var enc = cipher.update(str, 'utf8', 'hex');
  enc += cipher.final('hex');
  return enc;
}
function decrypt(str, secret) {
  var decipher = crypto.createDecipher('aes192', secret);
  var dec = decipher.update(str, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}
function gen_cookie(user, res) {
  var authToken = encrypt(user._id + '\t' + user.password +'\t' + user.email, config.system.session_secret);
  res.cookie(config.system.auth_cookie_name, authToken, { path: '/', maxAge: 1000*60*60*24*7 }); //cookie 有效期1周
}