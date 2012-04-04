/**
 * Created by JetBrains WebStorm.
 * User: nemo
 * Date: 12-3-28
 * Time: 下午8:17
 * To change this template use File | Settings | File Templates.
 */
var crypto = require('crypto');
var sanitize = require('validator').sanitize;
var User = require('../../models/sys/user_mod');
var config = require('../../../resources/config');
var mailCtrl = require('./mail_ser');

exports.signUp  = function(req, res, user) {
  User.find({ '$or': [{'name':req.body.name}, {'email':req.body.email}] }, function(err, users) {
    if (err) {
      req.pushMsg('error', '注册出错，请重试！');
      return res.redirect('/');
    }
    if (users.length > 0) {
      req.pushMsg('error', '昵称或邮箱已被占用！');
      return res.redirect('/');
    }

    // create gavatar
    //var avatar_url = 'http://www.gravatar.com/avatar/' + md5(email) + '?size=48';

    user.is_active = false;
    user.save(function(err) {
      if (err) {
        req.pushMsg('error', '注册出错，请重试！');
        return res.redirect('/');
      }
      mailCtrl.sendActiveMail(user.email, md5(user.email+config.system.session_secret),
        function(err, success) {
          if (success) {
            return res.render('sys/active', {success:'欢迎加入 ' + config.name + '！我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。'});
          }
        });
    });
  });
};

exports.signIn  = function(req, res) {

};

var md5 = function (str) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(str);
  str = md5sum.digest('hex');
  return str;
}