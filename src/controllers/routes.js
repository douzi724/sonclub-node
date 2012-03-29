/**
 * 控制器路由绑定
 * @nemo_zhong
 */
exports.bind = function bind(app) {
	console.log("bind start...");
	app.get('/come', function(req, res) {
		return res.render('coming.html');
	});
	//sign
	var sign_ctrl = require('./sys/signCtrl');
	app.get('/', sign_ctrl.sign);
	app.post('/signup', sign_ctrl.signUp);
	app.post('/signin', sign_ctrl.signIn);

	//user
	var user_ctrl = require('./user/userCtrl');
	app.get('/user', user_ctrl.info);
	
	console.log("bind success!!!");
};