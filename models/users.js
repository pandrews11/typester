var mongoose = require('mongoose'),
      Schema = mongoose.Schema;

var User = new Schema({
  username: { type: String, required: true, trim: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: Number, select: false },
  created_at: { type: Date },
  updated_at: {type: Date, default: Date.now }
});

mongoose.model('User', User);
