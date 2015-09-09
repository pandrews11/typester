var express  = require('express'),
    mongoose = require('mongoose'),
    router   = express.Router();

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
  })

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
        req.flash('error', 'error');
      }
      res.format({
        html: function() {
          res.location('/');
          res.redirect('/');
        }
      });
    });
  });

module.exports = router;
