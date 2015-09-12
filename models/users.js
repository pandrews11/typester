var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;


// Schema
var userSchema = new Schema({
  username: { type: String, required: true, trim: true, unique: true },
  admin: { type: Boolean, required: true, default: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false, required: true },
  correctWords: {type: Number, default: 0},
  wordsAttempted: {type: Number, default: 0},
  secondsPlayed: {type: Number, default: 0},
  gamesPlayed: { type: Number, require: true, default: 0 },
  created_at: { type: Date },
  updated_at: {type: Date, default: Date.now }
});

// Instance Methods

// userSchema.methods.isAdmin = function(cb) {
//   return this.admin == true;
// }

// Static Methods

// userSchema.statics.findByName = function(name, cb) {
//   return this.find({ name: new RegExp(name, 'i') }, cb)
// }

// Virtual Methods (attr_accessor sort of)

userSchema.virtual('wordsPerMinute').get(function() {
  return (this.correctWords / (this.secondsPlayed / 60)).toFixed(3);
});

userSchema.virtual('timePlayed').get(function() {
  console.log(this.secondsPlayed);
  return moment().startOf('day').add(this.secondsPlayed, 's').format('HH:mm:ss');
});

userSchema.virtual('accuracy').get(function() {
  return ((this.correctWords / this.wordsAttempted) * 100).toFixed(3);
});

var User = mongoose.model('User', userSchema);
module.exports = User;
