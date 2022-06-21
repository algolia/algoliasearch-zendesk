import gulp from 'gulp';
import eslint from 'gulp-eslint';

// eslint-disable-next-line no-warning-comments
// TODO we are now calling eslint directly, to remove entirely
export default function () {
  return gulp
    .src(['index.js', 'src/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
}
