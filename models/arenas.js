var mongoose = require('mongoose'),
      Schema = mongoose.Schema;

var Arena = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  created_at: { type: Date },
  updated_at: {type: Date, default: Date.now }
});

mongoose.model('Arena', Arena);
