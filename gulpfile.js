/**
 * Created by ngoctranfire on 9/13/15.
 */
// Include gulp
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var path = require('path');
var merge = require('merge-stream');
var runSequence = require('run-sequence');
// Include Our Plugins
var del = require('del');
var polybuild = require('polybuild');

//Clean output folder for stupid stuff.
gulp.task('clean', function(cb) {
    return del(['dist'], cb);
});

// Lint Task
gulp.task('js-lint', function jsLint() {
    return gulp.src('*.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jscs())
        .on('error', function(){})
        .pipe(plugins.jscsStylish.combineWithHintResults())
        .pipe(plugins.jshint().reporter('gulp-jshint-file-reporter', {
            filename: __dirname + '/logs/jshint-output.log'
        }));
});

gulp.task('scss-lint', function scssLint() {
    return gulp.src('public/stylesheets/*.scss')
        .pipe(plugins.scssLint({
            customReport: plugins.scssLintStylish,
            'endless': true,
            'config': 'scss-lint.yml',
            'reporterOutput': __dirname + '/logs/scssReport.json',
        }))
});

// Only client side js needs to be minified
gulp.task('scripts', function minify() {
    return gulp.src('public/js/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('public/js/dist'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/js/dist'));
});

gulp.task('compass', function() {
   return gulp.src('public/stylesheets/*.scss')
       .pipe(plugins.compass({
           project: path.join(__dirname),
           config_file: 'compass.rb',
           css: 'public/css',
           sass: 'public/scss'
       }))
       .pipe(gulp.dest('public/stylesheets/'));
});

gulp.task('babel', function babelize() {

    var app = gulp.src(['app.js'])
        .pipe(plugins.babel())
        .pipe(gulp.dest('dist'));

    var models = gulp.src(['model/*.js'])
        .pipe(plugins.babel())
        .pipe(gulp.dest('dist/model'));

    var routes = gulp.src(['routes/*.js'])
        .pipe(plugins.babel())
        .pipe(gulp.dest('dist/routes'));

    var public_js = gulp.src(['public/js/*.js'])
        .pipe(plugins.babel())
        .pipe(gulp.dest('dist/public/js'));

    return merge(app, models, routes, public_js);

});

gulp.task('copy', function() {
    "use strict";
    let bower = gulp.src(['bower_components/**/*'])
        .pipe(gulp.dest('dist/bower_components'));

    let statics = gulp.src(['public/**/*'])
        .pipe(gulp.dest('dist/'));

    let moveElementsBase = gulp.src(['dist/polymers/elements.html'])
        .pipe(gulp.dest('dist/'));

    del(['dist/polymers/elements.html']);

    return merge(bower, statics, moveElementsBase).pipe(plugins.size({title: 'copy'}));
});

gulp.task('jadify-polymers', function() {
    return gulp.src('views/polymers/*.jade')
       .pipe(plugins.jade({
           locals: {},
           pretty: true
       }))
       .pipe(gulp.dest('dist/polymers'));
});

gulp.task('vulcanize', function() {
    return gulp.src('dist/elements.html')
       .pipe(polybuild({maximumCrush: true}))
       .pipe(gulp.dest('dist/'));
});

gulp.task('rename-index', function() {
    gulp.src('dist/elements.build.html')
        .pipe(plugins.rename('vulcanized.html'))
        .pipe(gulp.dest('dist/'));
    return del(['dist/elements.build.html', 'dist/elements.html']);
});

// Watch Files For Changes
gulp.task('watch', function watch() {
    gulp.watch('*.js', ['js-lint', 'scss-lint', 'scripts']);
    gulp.watch('*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['clean'], function(cb) {
    runSequence(
        'jadify-polymers',
        'copy',
        'vulcanize', 'rename-index',
        cb);
});