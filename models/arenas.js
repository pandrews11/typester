var mongoose = require('mongoose'),
      moment = require('moment'),
      YAML   = require('yamljs'),
      Schema = mongoose.Schema;


var arenaSchema = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  mode: { type: String, required: true, default: 'singleplayer' },
  difficulty: { type: String, required: true, default: 'medium' },
  time: { type: Number, required: true, default: 30 },
  text: { type: String },
  playersQueued: { type: Number, default: 0 },
  created_at: { type: Date },
  updated_at: {type: Date, default: Date.now }
});

arenaSchema.pre('save', function(next) {
  var textsFile = YAML.load('texts.yml');
  var texts = textsFile.texts[this.difficulty];
  var idx = Math.floor(Math.random() * Object.keys(texts).length) + 1;

  this.text = texts[String(idx)];
  next();
});

arenaSchema.virtual('singleplayerReady').get(function() {
  return (this.mode == 'singleplayer' && this.playersQueued == 1);
});

arenaSchema.virtual('multiplayerReady').get(function() {
  return (this.mode == 'multiplayer' && this.playersQueued == 2);
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
