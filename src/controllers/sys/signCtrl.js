/**
 * 登录、注册模块控制器
 * @nemo_zhong
 */
var User = require('../../models/sys/userMod'),
    userSer = require('../../services/sys/userSer'),
    typeEnum = require('../../common/typeEnum');

/**
 * 登录、注册界面
 */
exports.sign = function(req, res) {
	return res.render('sys/sign.html');
};

/**
 * 注册用户
 */
exports.signUp = function(req, res) {
    req.sanitizeXss();
    if(User.validator(req, 'signup')) {
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

// auth_user middleware
exports.auth_user = function(req, res, next) {
	next();
};