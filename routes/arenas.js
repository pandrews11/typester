var express  = require('express'),
    router   = express.Router(),
    Arena    = require('../models/arenas'),
    User     = require('../models/users');

router.route('/create')
  .post(function(req, res) {
    var mode = req.body.mode,
        time = req.body.time,
        difficulty = req.body.difficulty;
    Arena.create({
      mode: mode,
      time: time,
      difficulty: difficulty
    }, function (err, arena) {
      User.findById(req.body.userId, function(err, user) {
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
  .delete(function(req, res) {
    Arena.findById(req.params.id, function(err, arena) {
      arena.remove(function(err) {
        if (err) {
          console.log(err)
        } else {
          res.redirect('/arenas')
        }
      })
    })

  });

router.route('/:id')
  .get(function(req, res, next) {
    Arena.findById(req.params.id)
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

  router.route('/')
    .get(function(req, res, next) {
      Arena.find({})
        .populate('users').exec( function(err, arenas) {
        res.format({
          html: function() {
            res.render('arenas', {
              'arenas' : arenas
            });
          }
        });
      });
    });

module.exports = router;
