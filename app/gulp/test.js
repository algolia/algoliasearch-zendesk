import gulp from 'gulp';
import mergeStream from 'merge-stream';

import babel from 'gulp-babel';
import istanbul from 'gulp-babel-istanbul';
import mocha from 'gulp-mocha';

export default function (cb) {
  mergeStream(
    gulp.src(['src/**/*.js', 'index.js'])
      .pipe(istanbul()),
    gulp.src(['test/**/*.js'])
      .pipe(babel())
  ).pipe(istanbul.hookRequire())
    .on('finish', function () {
      gulp.src(['test/**/*.js'])
       .pipe(mocha({reporter: 'mochawesome'}))
       .pipe(istanbul.writeReports()) // Creating the reports after tests ran
//       .pipe(istanbul.enforceThresholds({thresholds: {global: 90}})) // Enforce a coverage of at least 90%
       .on('end', cb);
    });
}
