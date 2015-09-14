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