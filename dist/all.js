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
var jadeStatic = require('connect-jade-static');
var passport = require('passport');
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

//var users = require('./routes/users');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-compass')({mode: 'expanded'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use(jadeStatic({
    baseDir: path.join(__dirname, '/views/partials'),
    baseUrl: '/partials',
    maxAge: 86400,
    jade: {pretty: true}
}));

/**
 * Start passport configurations!
 */
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
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
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

/**
 * Created by ngoctranfire on 9/13/15.
 */
// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var stylish = require('gulp-jscs-stylish');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var install = require("gulp-install");
var babel = require('gulp-babel');
var scsslint = require('gulp-scss-lint');
var scssLintStylish = require('gulp-scss-lint-stylish');

gulp.task('install', function installAll() {
    return gulp.src(['.bower.json', './package.json'])
        .pipe(install());
});

// Compile Our Sass
gulp.task('sass', function runSassCompile() {
    return gulp.src('public/stylesheets/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('public/stylesheets/'));
});

// Lint Task
gulp.task('js-lint', function jsLint() {
    return gulp.src('*.js')
        .pipe(jshint())
        .pipe(jscs())
        .on('error', function(){})
        .pipe(stylish.combineWithHintResults())
        .pipe(jshint.reporter('gulp-jshint-file-reporter', {
            filename: __dirname + '/logs/jshint-output.log',
        }));
});

gulp.task('scss-lint', function scssLint() {
    return gulp.src('public/stylesheets/*.scss')
        .pipe(scsslint({
            customReport: scssLintStylish,
            'endless': true,
            'config': 'scss-lint.yml',
            'reporterOutput': __dirname + '/logs/scssReport.json',
        }))
        .pipe(gulp.dest('./reports'));
});

// Concatenate & Minify JS -Not yet set up correctly!
gulp.task('scripts', function minify() {
    return gulp.src('*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('babel', function babelize() {

});

// Watch Files For Changes
gulp.task('watch', function watch() {
    gulp.watch('*.js', ['js-lint', 'scss-lint', 'scripts']);
    gulp.watch('*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['install', 'sass', 'js-lint', 'scss-lint', 'scripts', 'watch']);
/**
 * Created by ntran on 9/13/15.
 */
var install = require('gulp-install');

gulp.src(__dirname + '/templates/**')
    .pipe(gulp.dest('./'))
    .pipe(install({allowRoot: true}));

