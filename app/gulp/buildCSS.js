import chalk from 'chalk';
import gulp from 'gulp';

import cssnano from 'gulp-cssnano';
import gutil from 'gulp-util';
import header from 'gulp-header';
import rename from 'gulp-rename';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';

import pjson from '../package.json';

const entryPoint = 'css/index.scss';

const exportedFileBasename = 'algoliasearch.zendesk-hc';

const actionStr = `'${chalk.cyan('build:css')}'`;

const banner = `/*!
* ${pjson.description} v${pjson.version}
* ${pjson.homepage}
* Copyright ${(new Date()).getFullYear()} ${pjson.author}; Licensed ${pjson.license}
*/
`;

function build(prod) {
  let res = gulp.src(entryPoint);
  if (prod) {
    res = res.pipe(sourcemaps.init());
  }
  res = res.pipe(sass().on('error', sass.logError))
    .pipe(header(banner))
    .pipe(rename(`${exportedFileBasename}.css`))
    .pipe(gulp.dest('./dist'));
  if (prod) {
    res = res.pipe(cssnano({discardComments: {removeAll: true}}))
      .pipe(header(banner))
      .pipe(rename(`${exportedFileBasename}.min.css`))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist'));
  }
  return res;
}

export default function () {
  const prod = process.env.NODE_ENV === 'production';
  const envStr = chalk.yellow(process.env.NODE_ENV);
  gutil.log(`Environment for ${actionStr}: NODE_ENV=${envStr}`);
  return build(prod);
}
