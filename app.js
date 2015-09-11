var flash = require('express-flash');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var http = require('http');

var db = require('./db');
var User = require('./models/users');

var routes = require('./routes/index'),
    users = require('./routes/users'),
    arenas = require('./routes/arenas');

var app = express();
app.set('port', 3000);
var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(3000);
var io = require('socket.io')(server);

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
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
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
  req.db = db;
  next();
});

app.use(flash());

app.use('/', routes);
app.use('/users', users);
app.use('/arenas', arenas);

app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));

io.on('connection', function(socket) {
  console.log('connection')
  socket.on('arena-update', function(data) {
    console.log(data);
  });
});


module.exports = app;
