/**
 * 系统参数配置
 */

exports.system = {
  name: 'Son Club',
  description: '穗彩国际',
  host: '127.0.0.1',
  session_secret: 'son_club',
  auth_cookie_name: 'son_club',
  port: 3000,
  version: '0.0.1',

  admins: { admin: true }
};

exports.mail = {
// mail SMTP
  port: '',
  user: '',
  pass: '',
  host: '',
  sender: '',
  use_authentication: true

};