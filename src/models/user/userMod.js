/**
 * 用户模型
 * @nemo_zhong
 */
var base = require('../baseMod');

var User = new base.sc({
	id: { type: base.objId },
	type: { type: String },
	name: { type: String, index:true},
	password: { type: String },
	status: { type: Number },
	email: { type: String },
	weibo: { type: String },

	create_at: { type: Date, default: Date.now },
	update_at: { type: Date, default: Date.now }
});

module.exports = base.mo.model('SysUser', User);