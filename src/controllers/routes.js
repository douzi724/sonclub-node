/**
 * 控制器路由绑定
 * @nemo_zhong
 */
exports.bind = function bind(app) {
  console.log('bind start...');

  //sign
  var signCtrl = require('./sys/sign_ctrl');
  var authUrl = ['/match*'];
  for (var i = 0, len = authUrl.length; i < len; ++i) {
    app.get(authUrl[i], signCtrl.signAuth);
  }
  app.get('/', signCtrl.sign);
  app.post('/signup', signCtrl.signUp);
  app.post('/signin', signCtrl.signIn);
  app.get('/signout', signCtrl.signOut);

  //user
  var userCtrl = require('./user/user_ctrl');
  app.get('/user/active', userCtrl.activeUser);
  app.get('/user', userCtrl.info);

  //match
  var matchCtrl = require('./biz/match_ctrl');

  app.get('/match', matchCtrl.index);

  console.log('bind success!!!');
};