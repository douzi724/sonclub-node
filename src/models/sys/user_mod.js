/**
 * 用户模型
 * @nemo_zhong
 */
var base = require('../base_mod');

var modName = 'User';
var modFields = {
  id: { type: base.ObjectId },
  type: { type: String },
  name: { type: String, trim: true, index: { unique: true },
    ckRules: {
      '昵称字数必须在2-20位': 'len(4,20)'
    }
  },
  email: { type: String, trim: true, lowercase: true, index: { unique: true },
    ckRules: {
      'email格式不正确': 'isEmail()'
    }
  },
  password: { type: String, trim: true,
    ckRules: {
      '密码必须6位或以上': 'len(6,50)'
    }
  },
  weibo: { type: String, trim: true },
  is_active: { type: Boolean },
  status: { type: Number },


  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now }
};
module.exports = exports = base.schema(modName, modFields);

var ckTypes = {
  signin: ['email'],
  signup: ['name', 'email', 'password']
};

var xssTypes = {
  signup: ['name', 'email']
};
exports.modName = modName;
exports.modFields = modFields;
exports.ckTypes = ckTypes;

exports.sanitizeXss = function(mod, type) {
  return base.sanitizeXss(mod, xssTypes[type]);
};


