import gulp from 'gulp';
import {Instrumenter} from 'isparta';

import babel from 'gulp-babel';
import gutil from 'gulp-util';
import istanbul from 'gulp-istanbul';
import mergeStream from 'merge-stream';
import mocha from 'gulp-mocha';

const sourceFiles = ['src/**/*.js'];
const testFiles = ['test/**/*.js'];

function logBabelError(err) {
  gutil.log(err.toString());
  console.log(err.codeFrame);
  this.emit('end');
}

export function test() {
  let mochaOpts = {};
  if (process.env.NODE_ENV === 'development') {
    mochaOpts.reporter = 'nyan';
  }
  return gulp.src(testFiles)
    .pipe(babel()).on('error', logBabelError)
    .pipe(mocha(mochaOpts));
}

export function reportsTest(cb) {
  mergeStream(
    gulp.src(sourceFiles)
      .pipe(istanbul({instrumenter: Instrumenter, includeUntested: true})),
    gulp.src(testFiles)
      .pipe(babel())
  ).pipe(istanbul.hookRequire())
    .on('finish', () => {
      gulp.src(testFiles, {read: false})
        .pipe(mocha({reporter: 'spec'}))
        .pipe(istanbul.writeReports()) // Creating the reports after tests ran
          .on('end', cb);
    });
}
