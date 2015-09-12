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
      res.format({
        html: function(){
          res.render('users/show', {
            "user" : user
          });
        }
      });
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

router.route('/:name/updateFromResults')
  .put(function(req, res) {
    var correctWords = req.body.correctWords,
    wordsAttempted = req.body.wordsAttempted,
    secondsPlayed = req.body.secondsPlayed;

    User.findOne({username: req.params.name}, function(err, user) {
      user.correctWords += correctWords;
      user.wordsAttempted += wordsAttempted;
      user.secondsPlayed += secondsPlayed;
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

router.route('/create')
  .post(function(req, res) {
    var username = req.body.username,
        email    = req.body.email,
        password = req.body.password;
    User.create({
      username : username,
      email : email,
      password : password
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
