var express  = require('express'),
    router   = express.Router(),
    User     = require('../models/users');

router.route('/')
  .get(function(req, res, next) {
    User.find({}, function (err, users) {
      res.format({
        html: function(){
          res.render('users/index', {
            "users" : users
          });
        }
      });
    });
  });

router.route('/:id')
  .get(function(req, res, next) {
    User.findById(req.params.id, function (err, user) {
      if (user.username == 'guest') {
        res.redirect('/')
      } else {
        res.format({
          html: function(){
            res.render('users/show', {
              "user" : user
            });
          }
        });
      }
    });
  })
  .put(function(req, res, next) {
    var username = req.body.username,
        email    = req.body.email,
        admin    = req.body.admin || false,
        password = req.body.password;

    User.findById(req.params.id, function(err, user) {
      user.username = username;
      user.email = email;
      user.admin = admin;
      if (password)
        user.password = password;

      user.save(function(err) {
        req.flash('success', 'Your profile has been updated');
        req.session.user = user;
        res.format({
          html: function() {
            res.render('users/show', {
              'user': user
            })
          }
        });
      });
    });
  })
  .delete(function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
      user.remove(function(err) {
        if (err) {
          console.log(err)
        } else {
          res.redirect('/users')
        }
      });
    });
  });

router.route('/:id/updateFromResults')
  .put(function(req, res) {
    console.log("Posting results for User: " + req.params.id);
    console.log(req.body);
    User.findById(req.params.id, function(err, user) {
      user.correctWords += Number(req.body.correctWords);
      user.wordsAttempted += Number(req.body.wordsAttempted);
      user.secondsPlayed += Number(req.body.secondsPlayed);
      user.gamesPlayed += 1;

      user.save(function(err) {
        req.session.user;
        res.format({
          json: function() {
            res.send({update: 'success'});
          }
        });
      });
    });
  });

router.route('/create/')
  .post(function(req, res) {
    User.create({
      username : req.body.username,
      email : req.body.email,
      password : req.body.password
    }, function(err, user) {
      if (err) {
        var errorMessages = ''
        for (field in err.errors) {
          errorMessages += err.errors[field].message
        }
        req.flash('error', errorMessages);
      } else {
        req.session.user = user;
        req.flash('success', 'Welcome ' + user.username);
      }
      res.format({
        html: function() {
          res.redirect('/');
        }
      });
    });
  });

module.exports = router;
