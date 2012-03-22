/**
 * 系统参数配置
 */

exports.system = {
	name: 'Son Club',
	description: '穗彩国际',
	host: 'localhost',
	session_secret: 'son_club',
	auth_cookie_name: 'son_club',
	port: 3000,
	version: '0.0.1'
};

exports.mail = {
	// mail SMTP
	port: 25,
	user: 'club',
	pass: 'club',
	host: 'smtp.126.com',
	sender: 'club@126.com',
	use_authentication: true,

	//weibo app key
	weibo_key: 10000000,

	// admins
	admins: { admin:true }
};