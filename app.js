/**
 * Required packages import
 * @type {*|exports|module.exports}
 */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var url = require('url');
var fs = require('fs');
var hbs = require('express-hbs');
var LocalStrategy = require('passport-local').Strategy;

/**
 * Import models
 * @type {exports|module.exports}
 */
var db = require('./model/db');
var blob = require('./model/blobs');
var users = require('./model/user');

//Routes
var routes = require('./routes/index');
var blobs = require('./routes/blobs');

var users = require('./routes/users');

var app = express();
// view engine setup
app.engine('hbs', hbs.express4({
  defaultLayout: path.join(__dirname, 'views/layouts/main.hbs'),
  partialsDir: path.join(__dirname, 'views/partials'),
  layoutsDir: path.join(__dirname, 'views/layouts' )
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // jshint ignore:line
app.use('/bower_components', express.static(path.join(__dirname,'bower_components')));

/**
 * Start passport configurations!
 */
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  'use strict';
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  'use strict';
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use('login', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
      session: true
    },
    function verify(req, email, password, done) {
      'use strict';
      function onVerificationComplete(err, email) {
        if (err) {
          return done(err);
        }

      }
    }));

/**
 * End Passport Configurations
 */

app.use('/', routes);
app.use('/blobs', blobs);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use( function(req, res, next) {
  'use strict';
  var err = new Error('Not Found');
  console.log(err);
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use( function(err, req, res, next) {
    'use strict';
    console.log(err);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use( function(err, req, res, next) {
  'use strict';
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
