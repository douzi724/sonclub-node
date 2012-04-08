/**
 * sanitize trim and xss.
 * User: nemo
 * Date: 12-3-27
 * Time: 下午9:58
 */
var Validator = require('validator').Validator;

var validator = new Validator();

var reqHelper = function(req, res, next) {
  req.pushMsg = function(type, msg) {
    var msgs = this.flash('flashMsg');
    msgs.push(msg);
    this.flash('msgType', type);
    this.flash('flashMsg', msgs);
  };

  req.check = function(param, fail_msg) {
    return validator.check(this.param(param), fail_msg);
  };

  req.validator = function(Mod, ckType, modName) {
    var errors = new Array();

    validator.error = function(msg) {
      errors.push(msg);
    };

    var ckFields = Mod.ckTypes[ckType];
    var modFields = Mod.modFields;
    if (undefined === modName) {
      modName = '';
    }
    var mod = new Mod();
    for (var i = 0, len = ckFields.length; i < len; ++i) {
      var fieldName = modName + ckFields[i];
      var rules = modFields[ckFields[i]].ckRules;
      for (var r in rules) {
        eval("this.check('" + fieldName + "', '" + r + "')." + rules[r] + ";");
      }
      if (errors.length === 0) mod[ckFields[i]] = this.param(fieldName);
    }

    if (errors.length > 0 && errors[0] !== '') {
      req.pushMsg('error', errors);
      return mod = null;
    }
    return mod;
  };

  req.setFlashs = function(params) {
    for (var i = 0, len = params.length; i < len; ++i) {
      this.flash(params[i], this.param(params[i]));
    }
  };
  req.getFlashs = function(params) {
    var data = {};
    for (var i = 0, len = params.length; i < len; ++i) {
      data[params[i]] = this.flash(params[i]);
    }
    return data;
  };

  req.setPath = function() {
    var reqPath = this.path.toLocaleLowerCase();
    if (reqPath !== '' && reqPath.length > 0) {
      reqPath = reqPath.substring(1, reqPath.length);
    }
    this.flash('reqPath', reqPath);
  };

  return next();
};

module.exports = reqHelper;