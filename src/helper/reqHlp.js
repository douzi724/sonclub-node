/**
 * sanitize trim and xss.
 * User: nemo
 * Date: 12-3-27
 * Time: 下午9:58
 */

var sanitize = require('validator').sanitize;

var reqHelper = function(req, res, next) {
    req.pushMsg = function(type, msg) {
        var msgs = this.flash(type);
        msgs.push(msg);
        this.flash(type, msgs);
    };
    req.sanitizeXss = function(excludes) {
        // route params like /user/:id
        for(p in this.params) {
            if (undefined !== this.params[p]) {
                return this.params[p] = sanitize(sanitize(this.params[p]).trim()).xss();
            }
        }

        // query string params
        for(q in this.query) {
            if (undefined !== this.query[q]) {
                return this.query[q] = sanitize(sanitize(this.query[q]).trim()).xss();
            }
        }

        // request body params via connect.bodyParser
        for(b in this.body) {
            if (undefined !== this.body[b]) {
                return this.body[b] = sanitize(sanitize(this.body[b]).trim()).xss();
            }
        }
    }
    return next();
};

module.exports = reqHelper;