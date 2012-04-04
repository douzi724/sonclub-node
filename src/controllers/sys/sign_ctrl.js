/**
 * 登录、注册模块控制器
 * @nemo_zhong
 */
var User = require('../../models/sys/user_mod');
var userSer = require('../../services/sys/user_ser');
var EnumType = require('../../common/enum_type');

/**
 * 登录、注册界面
 */
exports.sign = function(req, res) {
  return res.render('sys/sign.html', {name : req.body.name});
};

/**
 * 注册用户
 */
exports.signUp = function(req, res) {
  //req.sanitizeXss('password');
  //var user = new User();
  //user['name'] = 'dsadsa';
  //user.save();
  //return res.render('match/index.html' , {foo : 'www'});
  var user = req.validator(User, 'signup')
  if (user === null) {
    req.pushPath();
    return res.redirect('/');
  } else {
    User.sanitizeXss(user, 'signup');
    userSer.signUp(req, res, user);
  }
};

/**
 * 登录系统
 */
exports.signIn = function(req, res, next) {
  var user = User.validator(req, 'signin');
  req.sanitizeXss('password');
  if (user == null) {
    return res.redirect('/');
  } else {
    userSer.signIn(req, res);
  }
};

// auth middleware
exports.signAuth = function(req, res, next) {
  return next();
  if (req.session.user) {
    if (config.admins[req.session.user.name]) {
      req.session.user.is_admin = true;
    }
    message_ctrl.get_messages_count(req.session.user._id,function(err,count){
      if(err) return next(err);
      req.session.user.messages_count = count;
      res.local('current_user',req.session.user);
      return next();
    });
  }else{
    var cookie = req.cookies[config.auth_cookie_name];
    if(!cookie) return next();

    var auth_token = decrypt(cookie, config.session_secret);
    var auth = auth_token.split('\t');
    var user_id = auth[0];
    User.findOne({_id:user_id},function(err,user){
      if(err) return next(err);
      if(user){
        if(config.admins[user.name]){
          user.is_admin = true;
        }
        message_ctrl.get_messages_count(user._id,function(err,count){
          if(err) return next(err);
          user.messages_count = count;
          req.session.user = user;
          res.local('current_user',req.session.user);
          return next();
        });
      }else{
        return next();
      }
    });
  }
};