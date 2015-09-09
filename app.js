var flash = require('express-flash');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session')

var db = require('./db');
var user = require('./models/users');

var routes = require('./routes/index'),
    users = require('./routes/users');


var app = express();
var port = 3000;

app.set('view engine', 'jade');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride(function(req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

app.use(cookieParser('secret-string'));
app.use(session({ cookie: { maxAge: 60000 }}));

app.use(flash());

app.use('/', routes);
app.use('/users', users)

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static('public'));

app.listen(port);
