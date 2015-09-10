var express  = require('express'),
    mongoose = require('mongoose'),
    router   = express.Router(),
    loggedIn = 0;

router.route('/')
  .get(function(req, res, next) {
    mongoose.model('User').find({}, function (err, users) {
      res.format({
        html: function(){
          res.render('users/index', {
            title: 'All Users',
            "users" : users
          });
        }
      });
    });
  });

router.route('/create')
  .post(function(req, res) {
    var username = req.body.username,
        email    = req.body.email,
        password = req.body.password;
    mongoose.model('User').create({
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

router.route('/login')
  .get(function(req, res, next) {
    res.format({
      html: function() {
        res.render('users/login')
      }
    });
  })

  .post(function(req, res) {
    var username = req.body.username,
        password = req.body.password;
    mongoose.model('User').findOne({
      username : username,
      password : password
    }, function(err, user) {
      if (err || user === null) {
        req.flash('error', 'Username or password are not correct');
      } else {
        req.session.user = user;
        req.flash('success', 'Welcome ' + user.username);
      }
      res.format({
        html: function() {
          res.location('/');
          res.redirect('/');
        }
      });
    });
  });

router.route('/logout')
  .get(function(req, res) {
    req.session.user = null;
    req.flash('success', 'Goodbye');
    res.format({
      html: function() {
        res.location('/');
        res.redirect('/');
      }
    });
  });

module.exports = router;
