var flash = require('express-flash');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var moment = require('moment');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var http = require('http');
var MongoStore = require('connect-mongo')(session);

var config = require('./config');
var db = require('./db');
var app = express();

// Flash middleware
app.use(flash());

// Set database
db.connect(config.db[app.get('env')]);

// Set port
var port = process.env.PORT || 3000;
app.set('port', port);

// Create server
var server = http.createServer(app);
server.listen(port);

app.set('view engine', 'jade');
app.set('views', 'views');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride(function(req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

app.use(cookieParser());
app.use(session({
  cookie: { maxAge: 60000 * 60 },
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  secret: 'secret-string',
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: db.connection })
}));

require('./routes/session')(app);


// Set routes

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/arenas', require('./routes/arenas'));

app.use(function(err, req, res, next) {
  if (err) {
    res.status(500);
    res.render('layout/500', {error : err} );
  } else {
    next();
  }
});

// Set models
var Arena = require('./models/arenas');
var User = require('./models/users');

// Web sockets
var io = require('socket.io')(server);

io.on('connection', function(socket) {

  // Wait for correct number of users to join a given arena
  // When correct number of players join arena, emit `beginCountdown`
  socket.on('join', function(data) {
    socket.join(data.arenaID);

    Arena.findById(data.arenaID, function(err, arena) {
      arena.playersQueued += 1;

      arena.save(function(err) {
        if (arena.singleplayerReady) {
          io.to(arena._id).emit('beginCountdown', { arenaID: arena._id });
        }

        if (arena.multiplayerReady) {
          io.to(arena._id).emit('beginCountdown', { arenaID: arena._id });
        }
      });
    });
  });

  // When client pushes an update, store visualization data.
  socket.on('update', function(data) {
    socket.broadcast.to(data.arenaID).emit('update', data)
  });

  socket.on('gameover', function(data) {
    socket.leave(data.arenaID);
    Arena.findByIdAndRemove(data.arenaID, function(err) {
    });
  });
});

module.exports = app;
