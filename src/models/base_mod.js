/**
 * 基础模型
 * @nemo_zhong
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var sanitize = require('validator').sanitize;

exports.mongoose = mongoose;
exports.Schema = Schema;
exports.ObjectId = Schema.ObjectId;

exports.schema = function(modelName, fields) {
  var sc = new Schema(fields);
  return mongoose.model(modelName, sc);
};

exports.sanitizeXss = function(mod, fields) {
  for (var i = 0, len = fields.length; i < len; ++i) {
    mod[fields[i]] = sanitize(mod[fields[i]]).xss()
  }
};