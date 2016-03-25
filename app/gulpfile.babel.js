import del from 'del';
import gulp from 'gulp';

import connect from 'gulp-connect';

import buildDocs from './gulp/buildDocs.js';
import buildCSS from './gulp/buildCSS.js';
import buildJS from './gulp/buildJS.js';
import lint from './gulp/lint.js';
import {test, reportsTest} from './gulp/test.js';

if (process.env.NODE_ENV !== 'production') process.env.NODE_ENV = 'development';

gulp.task('build:css', buildCSS);
gulp.task('build:css:watcher', () => gulp.watch('css/**/*.scss', ['build:css']));
gulp.task('build:css:watch', ['build:css', 'build:css:watcher']);

gulp.task('build:docs', buildDocs);
gulp.task('build:docs:watcher', () => gulp.watch('README.md', ['build:docs']));
gulp.task('build:docs:watch', ['build:docs', 'build:docs:watcher']);

gulp.task('build:js', buildJS);
gulp.task('build:js:watch', () => buildJS({watch: true}));

gulp.task('build', ['build:js', 'build:css', 'build:docs']);

gulp.task('clean', () => del(['dist/', 'dist-es5-module/', 'coverage/', 'mochawesome/']));

gulp.task('dev', ['build:js:watch', 'build:css:watch', 'build:docs:watch', 'server']);

gulp.task('lint', lint);

gulp.task('server', () => connect.server({root: './', port: process.env.PORT || 3000}));

gulp.task('test:run', test);
gulp.task('test:watcher', () => gulp.watch(['index.js', 'src/**', 'test/**'], ['test:run']));
gulp.task('test:watch', ['test:run', 'test:watcher']);
gulp.task('test:reports', reportsTest);
gulp.task('test', ['lint', 'test:reports']);
