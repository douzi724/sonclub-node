exports.ck = function check(req, ckRules, title) {
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
    var ckStr = "req.check('";
    var ckFields = ckRules.vTypes;
    for(f in ckFields) {
        var rules = ckRules[ckFields[f]];
        for (t in rules) {
            console.log(ckStr + f + "', '" + t + "')." + rules[t] + ";");
            eval(ckStr + f + "', '" + t + "')." + rules[t] + ";");
        }
    }
    if(errors.length > 1) {
        req.flash('errMsg', errors);
        hasErr = true;
    }
    return hasErr;
};