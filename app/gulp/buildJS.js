import chalk from 'chalk';
import gulp from 'gulp';

import babelify from 'babelify';
import browserify from 'browserify';
import envify from 'envify';
import stringify from 'stringify';
import uglifyify from 'uglifyify';
import watchify from 'watchify';

import babel from 'gulp-babel';
import buffer from 'vinyl-buffer';
import header from 'gulp-header';
import gutil from 'gulp-util';
import mergeStream from 'merge-stream';
import rename from 'gulp-rename';
import source from 'vinyl-source-stream';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';

import pjson from '../package.json';

const entryPoint = './index.js';

const exportedFileBasename = 'algoliasearch.zendesk-hc';
const exportedMethod = 'algoliasearchZendeskHC';

const banner = `/*!
* ${pjson.description} v${pjson.version}
* ${pjson.homepage}
* Copyright ${(new Date()).getFullYear()} ${pjson.author}; Licensed ${pjson.license}
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
  let res = browserify(entryPoint, {standalone: exportedMethod, debug: true});
  if (watch) {
    res = watchify(res, {poll: true});
  }
  res = res
    .transform({global: true}, stringify, {
      appliesTo: {includeExtensions: ['.txt']}
    })
    .transform(babelify)
    .transform(envify)
    .transform({global: true}, 'browserify-shim')
    .transform('browserify-versionify');
  if (prod) res = res.transform(uglifyify);
  return res;
}

function bundle({b, prod}) {
  let dist = b.bundle().on('error', mapError)
    .pipe(source(`${exportedFileBasename}.js`))
    .pipe(header(banner))
    .pipe(gulp.dest('./dist'));
  if (!prod) return dist;
  dist = dist
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(header(banner))
    .pipe(rename(`${exportedFileBasename}.min.js`))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'));
  let distES5 = gulp.src(['./index.js', './src/**/*.js'], {base: '.'})
    .pipe(babel())
    .pipe(gulp.dest('./dist-es5-module'));
  return mergeStream(dist, distES5);
}

const delay = 20;
let pending = false;
function oneAtATime(cb) {
  if (pending === false) {
    pending = true;
    cb().on('end', () => {
      pending = false;
    });
  } else {
    setTimeout(() => { oneAtATime(cb); }, delay);
  }
}

function timeBuild(...args) {
  const start = new Date();
  gutil.log(`Restart ${actionStr}`);
  let res = bundle.call(this, ...args);
  res.on('end', () => {
    const end = new Date();
    const time = (end.getTime() - start.getTime());
    const timeStr = chalk.magenta(time < 3000 ? `${time}ms` : `${time / 1000}s`);
    gutil.log(`Finished ${actionStr} in ${timeStr}`);
  });
  return res;
}

export default function ({watch = false}) {
  const prod = process.env.NODE_ENV === 'production';
  const envStr = chalk.yellow(process.env.NODE_ENV);
  gutil.log(`Environment for ${actionStr}: NODE_ENV=${envStr}`);
  let b = bundler({watch, prod});
  let res = bundle.call(this, {b, prod});
  if (watch) {
    b.on('update', oneAtATime.bind(this, () => timeBuild.call(this, {b, prod})));
  }
  return res;
}
