import chalk from 'chalk';
import gulp from 'gulp';

import babelify from 'babelify';
import browserify from 'browserify';
import envify from 'envify';
import uglify from 'gulp-uglify';
import watchify from 'watchify';

import babel from 'gulp-babel';
import buffer from 'vinyl-buffer';
import gutil from 'gulp-util';
import mergeStream from 'merge-stream';
import rename from 'gulp-rename';
import source from 'vinyl-source-stream';
import sourcemaps from 'gulp-sourcemaps';

const entryPoint = './index.js';

const exportedFileBasename = 'algoliasearch.zendesk-hc';
const exportedMethod = 'algoliasearchZendeskHC';

const banner = `/*!
* Algolia Search For Zendesk\s Help Center ${pjson.version}
* https://github.com/algolia/algoliasearch-zendesk
* Copyright ${(new Date()).getFullYear()} Algolia, Inc. and other contributors; Licensed MIT
*/
`;

const actionStr = `'${chalk.cyan('build:js')}'`;

function mapError(err) {
  const error = chalk.red(err.name);
  if (err.fileName) {
    // regular error
    const file = chalk.yellow(err.fileName.replace(`${__dirname}/src/js/`, ''));
    const line = chalk.magenta(err.lineNumber);
    const col = chalk.magenta(err.columnNumber || err.column);
    const desc = chalk.blue(err.description);
    gutil.log(`${error}: ${file}:${line}:${col}: ${desc}`);
  } else {
    const message = chalk.yellow(err.message);
    gutil.log(`${error}: ${message}`);
  }

  this.emit('end');
}

function bundler({watch, prod} = {}) {
  let res = browserify(entryPoint, {standalone: exportedMethod, debug: !prod});
  if (watch) {
    res = watchify(res);
  }
  return res
    .transform(babelify)
    .transform(envify);
}

function bundle({b, prod}) {
  let dist = b.bundle().on('error', mapError)
    .pipe(source(`${exportedFileBasename}.js`))
    .pipe(gulp.dest('./dist'));
  let distES5 = gulp.src(['./index.js', './src/**/*.js'], {base: '.'});
  if (prod) {
    dist = dist
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(uglify({banner}))
      .pipe(rename(`${exportedFileBasename}.min.js`))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist'));
    distES5 = distES5
      .pipe(babel())
      .pipe(gulp.dest('./dist-es5-module'));
  }
  return mergeStream(dist, distES5);
}

function timeBuild(...args) {
  const start = new Date();
  gutil.log(`Restart ${actionStr}`);
  let tmp = bundle.call(this, ...args);
  tmp.on('end', () => {
    const end = new Date();
    const time = (end.getTime() - start.getTime());
    const timeStr = chalk.magenta(time < 3000 ? `${time}ms` : `${time / 1000}s`);
    gutil.log(`Finished ${actionStr} in ${timeStr}`);
  });
}

export default function ({watch = false}) {
  const prod = process.env.NODE_ENV === 'production';
  const envStr = chalk.yellow(process.env.NODE_ENV);
  gutil.log(`Environment for ${actionStr}: NODE_ENV=${envStr}`);
  let b = bundler({watch, prod});
  let res = bundle.call(this, {b, prod});
  if (watch) {
    b.on('update', timeBuild.bind(this, {b, prod}));
  }
  return res;
}
