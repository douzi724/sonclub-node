/**
 * sanitize trim and xss.
 * User: nemo
 * Date: 12-3-27
 * Time: 下午9:58
 */

var reqHelper = function(req, res, next) {
  req.getReqParam = function(name) {
    if (undefined !== this.params[name]) {
      return this.params[name];
    }
    if (undefined !== this.query[name]) {
      return this.query[name];
    }
    if (undefined !== this.body[name]) {
      return this.body[name];
    }
  };

  req.pushMsg = function(type, msg) {
    var msgs = this.flash('flashMsg');
    msgs.push(msg);
    this.flash('msgType', type);
    this.flash('flashMsg', msgs);
  };

  req.validator = function(Mod, ckType) {
    var errors = new Array();
    this.onValidationError(function(msg) {
      errors.push(msg);
      return this;
    });

    var ckFields = Mod.ckTypes[ckType];
    var modFields = Mod.modFields;
    var mod = new Mod();
    for (var i = 0, len = ckFields.length; i < len; ++i) {
      var fieldName = Mod.modName.toLocaleLowerCase() + "." + ckFields[i];
      var rules = modFields[ckFields[i]].ckRules;
      for (var r in rules) {
        eval("req.check('" + fieldName + "', '" + r + "')." + rules[r] + ";");
      }
      if (errors.length === 0) mod[ckFields[i]] = this.getReqParam(fieldName);
    }

    if (errors.length > 0 && errors[0] !== '') {
      req.pushMsg('error', errors);
      return mod = null;
    }
    return mod;
  };
  


  req.pushPath = function() {
    var reqPath = this.path.toLocaleLowerCase();
    if (reqPath !== '' && reqPath.length > 0) {
      reqPath = reqPath.substring(1, reqPath.length);
    }
    this.flash('reqPath', reqPath);
  };

  return next();
};

module.exports = reqHelper;