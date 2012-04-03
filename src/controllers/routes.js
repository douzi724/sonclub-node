/**
 * 控制器路由绑定
 * @nemo_zhong
 */
exports.bind = function bind(app) {
  console.log('bind start...');

  //sign
  var signCtrl = require('sys/sign_ctrl.js');
  app.get('/', signCtrl.sign);
  app.post('/signup', signCtrl.signUp);
  app.post('/signin', signCtrl.signIn);

  //user
  var userCtrl = require('user/user_ctrl.js');
  app.get('/user', userCtrl.info);

  console.log('bind success!!!');
};