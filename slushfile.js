/**
 * Created by ntran on 9/13/15.
 */
var install = require('gulp-install');

gulp.src(__dirname + '/templates/**')
    .pipe(gulp.dest('./'))
    .pipe(install({allowRoot: true}));

