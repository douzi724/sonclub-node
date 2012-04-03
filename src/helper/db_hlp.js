var mongoose = require('mongoose');

exports.conn = function conn(config) {

  console.log('register models start...');
  //user
  require('../models/sys/user_mod.js');

  console.log('register models success!!!');

  console.log('connect to db start...');
  if (process.env.VCAP_SERVICES) {
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var mongo = env['mongodb-1.8'][0]['credentials'];
  } else {
    var mongo = {
      "hostname": "localhost",
      "port": 27017,
      "username": "",
      "password": "",
      "name": "son_club",
      "db": "son_club"
    }
  }
  var generateMongoUrl = function(obj) {
    obj.hostname = (obj.hostname || 'localhost');
    obj.port = (obj.port || 27017);
    obj.db = (obj.db || 'test');

    if (obj.username && obj.password) {
      return 'mongodb://' + obj.username + ':' + obj.password + '@' + obj.hostname + ':' + obj.port + '/' + obj.db;
    } else {
      return 'mongodb://' + obj.hostname + ':' + obj.port + '/' + obj.db;
    }
  }
  mongoose.connect(generateMongoUrl(mongo), function(err) {
    if (err) {
      console.log('connect to db error: ' + err.message);
      process.exit(1);
    } else {
      console.log('connect to db success!!!');
    }
  });
};