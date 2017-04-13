'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const nano = require('gulp-cssnano');

gulp.task('transpile', () => {
  return gulp.src('./src/js/form-carousel.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('./lib/js'));
});

gulp.task('uglify', () => {
  return gulp.src('./lib/js/form-carousel.js')
    .pipe(uglify())
    .pipe(rename('form-carousel.min.js'))
    .pipe(gulp.dest('./lib/js'));
});

gulp.task('buildJs', gulp.series('transpile', 'uglify'));

gulp.task('compileCss', () => {
  return gulp.src('./src/scss/form-carousel.scss')
    .pipe(sass({
      includePaths: './node_modules'
    }).on('error', sass.logError))
    .pipe(gulp.dest('./lib/css'));
});

gulp.task('minifyCss', () => {
  return gulp.src('./lib/css/form-carousel.css')
    .pipe(nano())
    .pipe(rename('form-carousel.min.css'))
    .pipe(gulp.dest('./lib/css'));
});

gulp.task('buildCss', gulp.series('compileCss', 'minifyCss'));

gulp.task('build', gulp.series('buildJs', 'buildCss'));

gulp.task('default', gulp.series('build'));

gulp.task('watchJs', () => {
  return gulp.watch('src/js/**/*', gulp.series('buildJs'));
});

gulp.task('watchCss', () => {
  return gulp.watch('src/scss/**/*', gulp.series('buildCss'));
});

gulp.task('watch', gulp.series(
  'build',
  'watchJs',
  'watchCss'
));
