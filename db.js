var mongoose = require('mongoose');
var db = mongoose;

db.connection.on('error', console.error);
db.connection.once('open', function(data) {
  console.log("Successfully connected to MongoDB (" + this.host + ")");
});

module.exports = db;
