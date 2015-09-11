var mongoose = require('mongoose'),
      Schema = mongoose.Schema;

var arenaSchema = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  type: { type: String, required: true, default: 'singleplayer' },
  difficulty: { type: String, required: true, default: 'medium' },
  time: { type: String, required: true, default: 'normal' },
  created_at: { type: Date },
  updated_at: {type: Date, default: Date.now }
});

// See models/users.js for use of instance, static, virtual methods

var Arena = mongoose.model('Arena', arenaSchema);
module.exports = Arena;
