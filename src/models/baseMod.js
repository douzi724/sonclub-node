/**
 * 基础模型
 * @nemo_zhong
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

exports.mongoose = mongoose;
exports.Schema = Schema;
exports.ObjectId = Schema.ObjectId;

exports.schema = function(modelName, fields) {
    var sc = new Schema(fields);
    return mongoose.model(modelName, sc);
};

exports.validator = function(req, fields, ckFields, title) {
    var hasErr = false;
    var errors = [];
    if(typeof title == "undefined") {
        errors.push('请符合以下要求:');
    } else {
        errors.push(title);
    }
    req.onValidationError(function(msg) {
        errors.push(msg);
        return this;
    });
    var evalCK = "";
    for(f in ckFields) {
        var rules = fields[ckFields[f]].ckRules;
        for (t in rules) {
            evalCK += "req.check('" + ckFields[f] + "', '" + t + "')." + rules[t] + ";";
        }
    }
    eval(evalCK);
    if(errors.length > 1) {
        req.flash('errMsg', errors);
        hasErr = true;
    }
    return hasErr;
};