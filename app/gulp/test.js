import gulp from 'gulp';
import babel from 'gulp-babel';
import istanbul from 'gulp-istanbul';
import mocha from 'gulp-mocha';
import gutil from 'gulp-util';
import { Instrumenter } from 'isparta';
import mergeStream from 'merge-stream';

const sourceFiles = ['src/**/*.js'];
const testFiles = ['test/**/*.js'];

function logBabelError(err) {
  gutil.log(err.toString());
  console.log(err.codeFrame);
  this.emit('end');
}

export function test() {
  const mochaOpts = {};
  if (process.env.NODE_ENV === 'development') {
    mochaOpts.reporter = 'nyan';
  }
  return gulp
    .src(testFiles)
    .pipe(babel())
    .on('error', logBabelError)
    .pipe(mocha(mochaOpts));
}

export function reportsTest(cb) {
  mergeStream(
    gulp
      .src(sourceFiles)
      .pipe(istanbul({ instrumenter: Instrumenter, includeUntested: true })),
    gulp.src(testFiles).pipe(babel())
  )
    .pipe(istanbul.hookRequire())
    .on('finish', () => {
      gulp
        .src(testFiles, { read: false })
        .pipe(mocha({ reporter: 'spec' }))
        .pipe(istanbul.writeReports()) // Creating the reports after tests ran
        .on('end', cb);
    });
}
