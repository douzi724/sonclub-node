/**
 * 主程序
 * @nemo_zhong
 */
var express = require('express'),
	swig = require('swig'),
	expressValidator = require('express-validator'),
	config = require('./resources/config'),   
	db = require('./src/helper/dbHlp'),
    routes = require('./src/controllers/routes');

var app = express.createServer();

console.log("app configure start...");
// configuration in all env
var static_dir = __dirname + '/public';
app.configure(function() {
	//init swig
	app.register('.html', swig);
	app.set('view engine', 'html');
	swig.init({
	    root: __dirname + '/views',
	    allowErrors: true // allows errors to be thrown and caught by express
	});
	app.set('views', __dirname + '/views');
	app.set('view options', { layout: false });

	app.use(express.bodyParser());
	app.use(expressValidator);
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({
		secret: config.system.session_secret
	}));

	// custom middleware
	app.use(require('./src/controllers/sys/signCtrl').auth_user);
    app.use(require('./src/helper/reqHlp.js'));
	//app.use(express.csrf());
});

//set static,dynamic helpers
app.helpers({
	config: config
});
app.dynamicHelpers({
	csrf: function(req, res) {
		return req.session ? req.session._csrf : '';
	},
	flashMsg: function (req, res) {
        return req.flash('flashMsg');
    },
    msgType: function (req, res) {
        return req.flash('msgType');
    }
});

app.configure('development', function() {
	console.log("--> development environment");
	app.use(express.static(static_dir));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
	//require('./hot_deployer');
});

app.configure('production', function() {
	console.log("--> production environment");
	var one_year = 1000*60*60*24*365;
	app.use(express.static(static_dir, { maxAge:one_year }));
	app.use(express.errorHandler()); 
	app.set('view cache', true);
});
console.log("app configure success!!!");

/*app.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.html');
    } else {
        next(err);
    }
});*/

//db conn
db.conn(config);

//bind controllers
routes.bind(app);

//startup
app.listen(process.env.VMC_APP_PORT || config.system.port);
console.log("Son Club listening on port %d in %s mode", app.address().port, app.settings.env);