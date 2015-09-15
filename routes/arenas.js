var express  = require('express'),
    router   = express.Router(),
    Arena    = require('../models/arenas'),
    User     = require('../models/users');

function createArena(req, res) {
  Arena.create({
    mode: req.body.mode,
    time: req.body.time,
    difficulty: req.body.difficulty
  }, function (err, arena) {
    User.findById(req.body.userId, function(err, user) {
      arena.users.push(user)
      arena.save();
      console.log("creation");
      console.log(arena);
      return arena;
    });
  });
}


router.route('/join')
  .post(function(req, res) {

    // Set arena search opts
    var userId = req.body.userId;
    var opts = {
      mode: req.body.mode,
      time: req.body.time,
      difficulty: req.body.difficulty
    }

    // Singleplayer will always create their own arena
    if (opts.mode == 'singleplayer') {
      Arena.create(opts, function(err, arena) {
        User.findById(userId, function(err, user) {
          arena.users.push(user);
          arena.save();
          res.redirect('/arenas/' + arena._id);
        });
      });
    } else {
      if (opts.mode == 'multiplayer') {
        var possibleArenas = findMultiplayerArena(opts);

        possibleArenas.exec(function(err, arenas) {
          var arena = arenas[0];
          if (arena) {
            User.findById(userId, function(err, user) {
              arena.users.push(user);
              arena.save();
              res.redirect('/arenas/' + arena._id);
            });
          }
        });

      } else {
        Arena.create(opts, function(err, arena) {
          User.findById(userId, function(err, user) {
            arena.users.push(user);
            arena.save();
            res.redirect('/arenas/' + arena._id);
          });
        });
      }
    }
  });


router.route('/:id')
  .delete(function(req, res) {
    Arena.findById(req.params.id, function(err, arena) {
      arena.remove(function(err) {
        res.redirect('/arenas')
      });
    });
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

function findMultiplayerArena(opts) {
  return Arena.find(opts);
}



module.exports = router;
