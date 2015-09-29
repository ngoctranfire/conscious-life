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
var install = require("gulp-install");
var del = require('del');
plugins({
    pattern: ['gulp-*', 'gulp.*'], // the glob(s) to search for
    config: 'package.json', // where to find the plugins, by default searched up from process.cwd()
    scope: ['dependencies', 'devDependencies', 'peerDependencies'], // which keys in the config to look within
    replaceString: /^gulp(-|\.)/, // what to remove from the name of the module when adding it to the context
    camelize: true, // if true, transforms hyphenated plugins names to camel case
    lazy: true, // whether the plugins should be lazy loaded on demand
    rename: {} // a mapping of plugins to rename
});

gulp.task('install', function installAll() {
    return gulp.src(['.bower.json', './package.json'])
        .pipe(install());
});

//Clean output folder for stupid stuff.
gulp.task('clean', function(cb) {
    del(['dist']);
});

// Lint Task
gulp.task('js-lint', function jsLint() {
    return gulp.src('*.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jscs())
        .on('error', function(){})
        .pipe(plugins.jscsStylish.combineWithHintResults())
        .pipe(plugins.jshint().reporter('gulp-jshint-file-reporter', {
            filename: __dirname + '/logs/jshint-output.log',
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
   gulp.src('public/stylesheets/*.scss')
       .pipe(plugins.compass({
           project: path.join(__dirname),
           config_file: 'compass.rb',
           css: 'public/css',
           sass: 'public/scss',
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
    var bower = gulp.src(['bower_components/**/*'])
        .pipe(gulp.dest('dist/bower_components'));

    var polymer_elements = gulp.src(['views/polymers/*'])
        .pipe(gulp.dest('dist/polymers'));

    var statics = gulp.src(['public/**/*'])
        .pipe(gulp.dest('dist/'));

    return merge(bower, polymer_elements, statics).pipe(plugins.size({title: 'copy'}));
});

gulp.task('jadify-polymers', function() {
    return gulp.src('views/polymers/*.jade')
       .pipe(jade({
           locals: {},
           pretty: true,
       }))
       .pipe(gulp.dest('dist/polymers'));
});
gulp.task('vulcanize', function() {
    return gulp.src('dist/elements.html')
       .pipe(polybuild({maximumCrush: true}))
       .pipe(gulp.dest('dist/'));

});

// Watch Files For Changes
gulp.task('watch', function watch() {
    gulp.watch('*.js', ['js-lint', 'scss-lint', 'scripts']);
    gulp.watch('*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['clean'], function() {
    runSequence(
        ['jadify-polymers', 'copy'],
        

    )
});