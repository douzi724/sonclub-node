/**
 * 登录、注册模块控制器
 * @nemo_zhong
 */
var User = require('../../models/sys/user_mod');
var userSer = require('../../services/sys/user_ser');
var config = require('../../../resources/config');
var EnumType = require('../../common/enum_type');

/**
 * 登录、注册界面
 */
exports.sign = function(req, res) {
  if (req.session.user) {
    return res.redirect('/match');
  }
  return res.render('sys/sign.html', req.getFlashs(['name', 'email', 'password', 'reqPath']));
};

/**
 * 注册用户
 */
exports.signUp = function(req, res) {
  var user = req.validator(User, 'signup');
  req.setPath();
  req.setFlashs(['name', 'email', 'password']);
  if (user === null) {
    return res.redirect('home');
  } else {
    User.sanitizeXss(user, 'signup');
    userSer.signUp(req, res, user);
  }
};

/**
 * 登录系统
 */
exports.signIn = function(req, res, next) {
  var user = req.validator(User, 'signin');
  req.setFlashs(['email']);
  if (user === null) {
    return res.redirect('/');
  } else {
    User.sanitizeXss(user, 'signin');
    userSer.signIn(req, res, user);
  }
};

/**
 * 登出
 */
exports.signOut = function(req, res) {
  req.session.destroy();
  res.clearCookie(config.system.auth_cookie_name, { path: '/' });
  res.redirect('home');
};

// auth middleware
exports.signAuth = function(req, res, next) {
  userSer.signAuth(req, res, next);
};