var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.user) {
    res.render( 'index', { title: 'typester'} )
  } else {
    res.redirect( '/users/login');
  }
});

module.exports = router;
