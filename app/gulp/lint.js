import gulp from 'gulp';

import eslint from 'gulp-eslint';

export default function () {
  return gulp.src(['index.js', 'src/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
}
