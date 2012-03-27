/**
 * 登录、注册模块控制器
 * @nemo_zhong
 */
var User = require('../../models/sys/userMod'),
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
exports.signUp = function(req, res, next) {
    /*var user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.save(function(err){
        return res.render('sys/sign.html');
    });*/

    req.body.type = typeEnum.userType.normal;
    req.sanitizeXss();
    if(User.validator(req, 'signup')) {
        return res.render('sys/sign.html' , {foo : req.body.name});
    } else {
        return res.render('match/index.html');
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