var express = require('express');
var router = express.Router();
var User = require('../models/users')

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.user) {
    res.render( 'index', { title: 'typester'} )
  } else {
    res.redirect( '/login');
  }
});

router.route('/login')
  .get(function(req, res, next) {
    res.format({
      html: function() {
        res.render('login')
      }
    });
  })

  .post(function(req, res) {
    var username = req.body.username,
        password = req.body.password;
    User.findOne({
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
          res.redirect('/');
        }
      });
    });
  });

router.route('/logout')
  .get(function(req, res) {
    req.session.destroy();
    res.format({
      html: function() {
        res.redirect('/');
      }
    });
  });

module.exports = router;
