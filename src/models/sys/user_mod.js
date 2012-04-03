/**
 * 用户模型
 * @nemo_zhong
 */
var base = require('../base_mod.js');

var modFields = {
  id: { type: base.ObjectId },
  type: { type: String },
  name: { type: String, index: true,
    ckRules: {
      '昵称字数必须在2-20位': 'len(2,20)'
    }
  },
  email: { type: String,
    ckRules: {
      'email格式不正确': 'isEmail()'
    }
  },
  password: { type: String,
    ckRules: {
      '密码必须6位或以上': 'len(6,50)'
    }
  },
  status: { type: Number },

  weibo: { type: String },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now }
};
module.exports = exports = base.schema('SysUsers', modFields);

var ckTypes = {
  signin: ['email'],
  signup: ['name','email','password']
};
exports.validator = function(req, ckType) {
  return base.validator(req, modFields, ckTypes[ckType]);
};


