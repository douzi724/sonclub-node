/**
 * 基础模型
 * @nemo_zhong
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

exports.mongoose = mongoose;
exports.Schema = Schema;
exports.ObjectId = Schema.ObjectId;

exports.schema = function(modelName, fields) {
  var sc = new Schema(fields);
  return mongoose.model(modelName, sc);
};

exports.validator = function(req, fields, ckFields) {
  var errors = new Array();
  req.onValidationError(function(msg) {
    errors.push(msg);
    return this;
  });
  /*if(typeof title === "undefined") {
   errors.push('请符合以下要求:');
   } else {
   errors.push(title);
   }*/

  var evalCK = '';
  for (var f in ckFields) {
    var rules = fields[ckFields[f]].ckRules;
    for (var r in rules) {
      evalCK += "req.check('" + ckFields[f] + "', '" + r + "')." + rules[r] + ";";
    }
  }
  eval(evalCK);

  if (errors.length > 1 && errors[0] !== '') {
    req.pushMsg('error', errors);
    return true;
  }
  return false;
};