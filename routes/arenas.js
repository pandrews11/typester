var express  = require('express'),
    mongoose = require('mongoose'),
    router   = express.Router();

router.route('/create')
  .post(function(req, res) {
    mongoose.model('Arena').create({}, function (err, arena) {
      mongoose.model('User').findById(req.body.userId, function(err, user) {
        arena.users.push(user)
        arena.save();
      });

      res.format({
        html: function() {
          res.redirect('/arenas/' + arena.id)
        }
      });
    });
  });

router.route('/:id')
  .get(function(req, res, next) {
    mongoose.model('Arena').findById(req.params.id)
      .populate('users').exec( function(err, arena) {
      res.format({
        html: function() {
          res.render('arenas/show', {
            'arena' : arena
          });
        }
      });
    });
  });

module.exports = router;
