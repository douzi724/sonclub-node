/**
 * 系统参数配置
 */

exports.system = {
  name: 'Son Club',
  description: '穗彩国际',
  host: 'sonclub.cloudfoundry.com',
  session_secret: 'son_club',
  auth_cookie_name: 'son_club',
  port: 3000,
  version: '0.0.1',

  admins: { admin: true }
};

exports.mail = {
  // mail SMTP
  port: 465,
  user: 'sonclub2012@gmail.com',
  pass: '1.6180339887',
  host: 'smtp.gmail.com',
  sender: 'sonclub2012@gmail.com',
  use_authentication: true

};