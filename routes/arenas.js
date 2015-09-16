var express  = require('express'),
    router   = express.Router(),
    Arena    = require('../models/arenas'),
    User     = require('../models/users');

router.route('/statusUpdate/:arenaID')
  .get(function(req, res) {
    Arena.findById(req.params.arenaID)
      .populate('users').exec( function(err, arena) {
      res.format({
        json: function() {
          res.json({
            'arena': arena
          });
        },
        html: function() {
          res.render('arenas/_users_stats', {
            'arena': arena
          });
        }
      });
    });
  });

router.route('/join')
  .post(function(req, res) {

    // Set arena search opts
    var userId = req.body.userId;
    var opts = {
      mode: req.body.mode,
      time: req.body.time,
      difficulty: req.body.difficulty
    }

    console.log("User ID: " + userId);
    console.log("Opts: ", opts);

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
          console.log("Possible Arenas: ", arenas);
          var arena = arenas[0];
          if (arena && arena.users.length < 2) {
            User.findById(userId, function(err, user) {
              arena.users.push(user);
              arena.save();
              res.redirect('/arenas/' + arena._id);
            });
          } else {
            console.log("Creating Multiplayer Arena")
            Arena.create(opts, function(err, arena) {
              User.findById(userId, function(err, user) {
                arena.users.push(user);
                arena.save();
                res.redirect('/arenas/' + arena._id);
              });
            });
          }
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
  return Arena.find(opts).populate('users');
}



module.exports = router;
