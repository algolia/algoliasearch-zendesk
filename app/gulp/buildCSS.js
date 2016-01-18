import chalk from 'chalk';
import gulp from 'gulp';

import cssnano from 'gulp-cssnano';
import gutil from 'gulp-util';
import rename from 'gulp-rename';
import sourcemaps from 'gulp-sourcemaps';

const entryPoint = 'css/style.css';

const exportedFileBasename = 'algoliasearch.zendesk-hc';

const actionStr = `'${chalk.cyan('build:css')}'`;

function build(prod) {
  let res = gulp.src(entryPoint);
  if (prod) {
    res = res.pipe(sourcemaps.init());
  }
  res = res.pipe(rename(`${exportedFileBasename}.css`))
    .pipe(gulp.dest('./dist'));
  if (prod) {
    res = res.pipe(cssnano())
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
