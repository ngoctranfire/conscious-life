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
var browserSync = require('browser-sync');

//Clean output folder for stupid stuff.
gulp.task('clean', function(cb) {
  'use strict';
  return del(['dist'], cb);
});

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10',
];

var styleTask = function(stylesPath, srcs) {
  'use strict';
  return gulp.src(srcs.map(function(src) {
    return path.join('dist', stylesPath, src);
  }))
    .pipe(plugins.changed(stylesPath, {extension: '.css'}))
    .pipe(plugins.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/' + stylesPath))
    .pipe(plugins.cssmin())
    .pipe(gulp.dest('dist/' + stylesPath))
    .pipe(plugins.size({title: stylesPath}));
};

gulp.task('prefix-css', function autoPrefixCSS() {
  'use strict';
  return styleTask('css', ['**/*.css']);
});

gulp.task('prefix-polymers', function autoPrefixPolymers() {
  'use strict';
  return styleTask('polymers', ['**/*.css']);
});

// Lint Task
gulp.task('jshint', function jsLint() {
  'use strict';
  return gulp.src(['dist/js',
        'dist/polymers/**/*.js',
        'gulpfile.js',
    ])
    .pipe(browserSync.reload({stream: true, once: true}))
    .pipe(plugins.jshint())
    .pipe(plugins.jscs())
    .on('error', function onError() {
      console.log('Reporting errors to logs/jshint-output.log');
    })
    .pipe(plugins.jscsStylish.combineWithHintResults())
    .pipe(plugins.jshint.reporter('gulp-jshint-file-reporter', { filename: __dirname + '/logs/jshint-output.log' }));
});

gulp.task('scss-lint', function scssLint() {
  'use strict';
  return gulp.src('public/scss/*.scss')
    .pipe(plugins.scssLint({
      customReport: plugins.scssLintStylish,
      config: 'scss-lint.yml',
      reporterOutput: __dirname + '/logs/scssReport.json',
      endless: true,
    }));
});

gulp.task('compass', function compass() {
  'use strict';
  return gulp.src('public/stylesheets/*.scss')
    .pipe(plugins.compass({
      project: path.join(__dirname),
      configFile: 'compass.rb',
      css: 'public/css',
      sass: 'public/scss',
    }))
    .pipe(gulp.dest('public/stylesheets/'));
});

gulp.task('babel', function babelize() {
  'use strict';
  return gulp.src(['public/js/*.js'])
        .pipe(plugins.babel())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('copy', function copy() {
  'use strict';

  var bower = gulp.src(['bower_components/**/*'])
        .pipe(gulp.dest('dist/bower_components'));

  var statics = gulp.src(['public/**/*'])
      .pipe(gulp.dest('dist/'));

  var moveElementsBase = gulp.src(['dist/polymers/elements.html'])
      .pipe(gulp.dest('dist/'));

  del(['dist/polymers/elements.html']);

  return merge(bower, statics, moveElementsBase).pipe(plugins.size({title: 'copy'}));
});

gulp.task('jadify-polymers', function jadifyPolymers() {
  'use strict';
  return gulp.src('views/polymers/*.jade')
   .pipe(plugins.jade({
     locals: {},
     pretty: true,
   }))
   .pipe(gulp.dest('dist/polymers'));
});

gulp.task('vulcanize', function vulcanize() {
  'use strict';
  return gulp.src('dist/elements.html')
       .pipe(polybuild({maximumCrush: true}))
       .pipe(gulp.dest('dist/'));
});

gulp.task('rename-index', function renameVulcanized() {
  'use strict';
  gulp.src('dist/elements.build.html')
    .pipe(plugins.rename('vulcanized.html'))
    .pipe(gulp.dest('dist/'));
  return del(['dist/elements.build.html', 'dist/elements.html']);
});

gulp.task('watch', function watch() {
  'use strict';
  gulp.watch('*.js', ['jshint']);
  gulp.watch('*.scss', ['scss-lint']);
});

// Default Task
gulp.task('default', ['clean'], function sequenceTasks(cb) {
  'use strict';
  runSequence(
      'jadify-polymers', 'compass',
      'copy',
      'babel',
      'vulcanize', 'rename-index',
      ['jshint', 'prefix-css', 'prefix-polymers', 'scss-lint'],
      'watch',
    cb);
});
