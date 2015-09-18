var mongoose = require('mongoose'),
      moment = require('moment'),
      Schema = mongoose.Schema;


var arenaSchema = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  mode: { type: String, required: true, default: 'singleplayer' },
  difficulty: { type: String, required: true, default: 'medium' },
  time: { type: Number, required: true, default: 30 },
  playersQueued: { type: Number, default: 0 },
  created_at: { type: Date },
  updated_at: {type: Date, default: Date.now }
});

arenaSchema.pre('remove', function(next) {
  this.users.forEach(function(user) {
    user.currentStatus = '';
    user.currentWPM = 0;
    user.currentAccuracy = '';
    user.save();
  });
  next();
});

arenaSchema.virtual('formattedTime').get(function() {
  return moment(0).seconds(this.time).format('mm:ss');
});

arenaSchema.virtual('formattedMode').get(function() {
  return this.mode.charAt(0).toUpperCase() + this.mode.substring(1);
});

arenaSchema.virtual('formattedDifficulty').get(function() {
  return this.difficulty.charAt(0).toUpperCase() + this.difficulty.substring(1);
});

// See models/users.js for use of instance, static, virtual methods

var Arena = mongoose.model('Arena', arenaSchema);
module.exports = Arena;
