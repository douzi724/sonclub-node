/**
 * 用户模块控制器
 * @nemo_zhong
 */
var User = require('../../models/sys/user_mod');
var userSer = require('../../services/sys/user_ser');

/**
 * 激活帐号
 */
exports.activeUser  = function(req, res) {
  var user = req.validator(User, 'signin');
  if (user !== null) {
    User.sanitizeXss(user, 'signin');
    userSer.activeUser(req, res, user);
  } else {
    return res.redirect('home');
  }
};


/**
 * 用户信息
 */
exports.info = function(req, res, next) {
  var user = new User();
  user.name = 'nemo';
  user.save(function(err) {
    if (err) return res.render('home.html', { foo: 'error' });
    res.render('home.html', { foo: 'success' });
  });
};