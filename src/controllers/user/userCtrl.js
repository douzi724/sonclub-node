/**
 * 用户模块控制器
 * @nemo_zhong
 */
var User = require('../../models/sys/userMod');

/**
 * 用户信息
 */
exports.info = function(req, res, next){
	var user = new User();
	user.name = "nemo";
	user.save(function(err) {
				if (err) return res.render('home.html', { foo: 'error' });
				res.render('home.html', { foo: 'success' });
			});
};