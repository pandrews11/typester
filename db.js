var mongoose = require('mongoose');
var uri = 'mongodb://typester_client:typester_client@ds049888.mongolab.com:49888/typester'

var db = mongoose.connect(uri);

mongoose.connection.on('open', function() {
  console.log('connected');
});

mongoose.connection.on('error', function() {
  console.log('connection error');
});

module.exports = db;
