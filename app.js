var express = require('express');
var path = require('path');
var compression = require('compression');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var url = require('url');

//Mongo
var dbURL = process.env.MONGOLAB_URI || "mongodb://localhost/Waves";

var db = mongoose.connect(dbURL, function(err){
  if(err) {
    console.log("Could not connect to database.");
    throw err;
  }
});

//Redis
var redisURL = {
  hostname: 'localhost',
  port: 6379
};

var redisPASS;

if(process.env.REDISCLOUD_URL){
  redisURL = url.parse(process.env.REDISCLOUD_URL);
  redisPASS = redisURL.auth.split(':')[1];
}

var routes = require('./routes/index');

var port = process.env.PORT || process.env.NODE_PORT || 3000;

var app = express();

//Set up Socket.io and attach it to the app
var io = require('./io');
app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  key: "sessionid",
  secret: "Queen B",
  resave: true,
  saveUninitialized: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

routes(app);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
