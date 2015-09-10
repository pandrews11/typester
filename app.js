var flash = require('express-flash');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var db = require('./db');
var user = require('./models/users');
var arena = require('./models/arenas');

var routes = require('./routes/index'),
    users = require('./routes/users'),
    arenas = require('./routes/arenas');


var app = express();

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
app.use(session({
  cookie: { maxAge: 60000 * 60 },
  secret: 'secret-string',
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({
    db: 'typster_db',
    host: 'localhost',
    collection: 'session',
    autoReconnect: true
  })
}));

app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use(flash());

app.use('/', routes);
app.use('/users', users);
app.use('/arenas', arenas);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));

module.exports = app;
