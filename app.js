var express = require('express'),
          $ = require('jquery');

var app = express();
var port = 3000;


app.set('view engine', 'jade');
app.set('views', 'views');

app.use(express.static('public'));

app.get("/", function(req, res) {
    res.render('index', { title: 'Hello', message: 'World'});
});

app.get('/play', function(req, res) {
  res.render('type', {layout: false})
});

app.listen(port);
