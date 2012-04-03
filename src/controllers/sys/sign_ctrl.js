/**
 * 登录、注册模块控制器
 * @nemo_zhong
 */
var User = require('../../models/sys/user_mod.js');
var userSer = require('../../services/sys/user_ser.js');
var EnumType = require('../../common/enum_type.js');

/**
 * 登录、注册界面
 */
exports.sign = function(req, res) {
  return res.render('sys/sign.html', {foo : 'sss'});
};

/**
 * 注册用户
 */
exports.signUp = function(req, res) {
  req.sanitizeXss();
  //return res.render('match/index.html' , {foo : 'www'});
  if (User.validator(req, 'signup')) {
    return res.render('sys/sign.html' , {signAction : 'signUp'});
  } else {
    userSer.create(req, res, User);
  }
};

/**
 * 登录系统
 */
exports.signIn = function(req, res, next) {

};

// auth middleware
exports.auth = function(req, res, next) {
  next();
};