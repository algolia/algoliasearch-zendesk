import gulp from 'gulp';

import connect from 'gulp-connect';

import buildDocs from './gulp/buildDocs.js';
import buildCSS from './gulp/buildCSS.js';
import buildJS from './gulp/buildJS.js';
import lint from './gulp/lint.js';
import test from './gulp/test.js';

if (process.env.NODE_ENV !== 'production') process.env.NODE_ENV = 'development';

gulp.task('build:css', buildCSS);
gulp.task('build:css:watcher', function () { return gulp.watch('css/**/*.css', ['build:css']); });
gulp.task('build:css:watch', ['build:css', 'build:css:watcher']);

gulp.task('build:docs', buildDocs);
gulp.task('build:docs:watcher', function () { return gulp.watch('./README.md', ['build:docs']); });
gulp.task('build:docs:watch', ['build:docs', 'build:docs:watcher']);

gulp.task('build:js', buildJS);
gulp.task('build:js:watch', function () { return buildJS.call(this, {watch: true}); });

gulp.task('build', ['build:js', 'build:css', 'build:docs']);

gulp.task('lint', lint);

gulp.task('test:coverage', test);
gulp.task('test', ['lint', 'test:coverage']);

gulp.task('server', function () { return connect.server({root: 'dist/', port: process.env.PORT || 3000}); });
gulp.task('dev', ['build:js:watch', 'build:css:watch', 'build:docs:watch', 'server']);
