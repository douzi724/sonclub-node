/**
 * 登录、注册模块控制器
 * @nemo_zhong
 */
var User = require('../../models/user/userMod');

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
	var errors = [];
	req.onValidationError(function(msg) {
	    errors.push(msg);
	    return this;
	});
	req.check('name', '昵称不能为空').notEmpty();
	req.check('email', '邮箱不能为空').notEmpty();
	req.check('email', '邮箱格式有误').isEmail();
	req.check('password', '密码不能为空').len(6);

	if(errors.length != 0) {
		return res.redirect('/sign');
	} else {
		req.flash('successMsg', ['恭喜，注册成功！']);
		return res.render('match/index.html');
	}
};

/**
 * 登录系统
 */
exports.signIn = function(req, res, next) {
	var errors = [];
	req.onValidationError(function(msg) {
	    errors.push(msg);
	    return this;
	});
	req.check('email', '邮箱不能为空').notEmpty();
	if(errors.length == 0) {
		req.check('email', '邮箱格式有误!').isEmail();
	}
	req.check('password', '密码不能为空').notEmpty();
	req.flash('errMsg', errors);

	if(errors.length != 0) {
		return res.redirect("/sign");
	} else {
		req.flash('successMsg', ['恭喜，注册成功！']);
		return res.render('match/index.html');
	}
};

// auth_user middleware
exports.auth_user = function(req, res, next) {
	next();
};