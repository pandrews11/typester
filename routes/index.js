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
    User.findOne({
      username : req.body.username,
      password : req.body.password
    }, function(err, user) {

      if (err || user === null) {
        req.flash('error', 'Username or password are not correct');
      } else {
        req.session.user = user;
        req.flash('success', 'Welcome ' + user.username);
      }

      res.redirect('/')
    });
  });

router.route('/login/guest')
  .get(function(req, res, next) {
    User.findOne({username: 'guest'}, function(err, user) {
      req.session.user = user;
      res.redirect('/');
    });
  });


router.route('/logout')
  .get(function(req, res) {
    req.session.destroy();
    res.redirect('/');
  });

module.exports = router;
