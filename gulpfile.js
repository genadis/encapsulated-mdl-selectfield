(function() {
  'use strict';

  var gulp = require('gulp'),
      concat = require('gulp-concat'),
      rename = require('gulp-rename'),
      sass = require('gulp-sass'),
      sourcemaps = require('gulp-sourcemaps'),
      sassFiles = [
        './src/global.scss',
        './src/**/*.scss'
      ],
      uglify = require('gulp-uglifyjs'),
      jsFiles = ['src/**/*.js'];

  /* encapsulation PATCH
   */
  var replace = require('gulp-replace');
  var runSequence = require('run-sequence');
  var vendor = "'Google'";
  var vendorPrefix = 'mdl';
  var dependency = "'encapsulated-mdl'";


  gulp.task('sass-compress', function() {
    gulp
      .src(sassFiles)
      .pipe(concat('file.scss'))
      .pipe(sourcemaps.init())
      .pipe(sass({
        outputStyle: 'compressed'
      }).on('error', sass.logError))
      .pipe(rename(function(path) {
        path.dirname = '';
        path.basename = 'mdl-selectfield';
        path.extname = '.min.css';
      }))
      .pipe(sourcemaps.write('./'))
      .pipe(replace('.mdl-', '.' + vendorPrefix + '-'))
      .pipe(gulp.dest('./dist'));
  });

  gulp.task('sass', function () {
    gulp
      .src(sassFiles)
      .pipe(concat('mdl-selectfield.scss'))
      .pipe(sass({
        sourceComments: false
      }).on('error', sass.logError))
      .pipe(replace('.mdl-', '.' + vendorPrefix + '-'))
      .pipe(gulp.dest('./dist'));
  });

  gulp.task('js-compress', function() {
    gulp
      .src(jsFiles)
      .pipe(replace('mdl-', vendorPrefix + '-'))
      .pipe(replace('$$vendorName$$', vendor))
      .pipe(replace('$$mdlDepName$$', dependency))
      .pipe(uglify('mdl-selectfield.min.js', {
        outSourceMap: true
      }))
      .pipe(gulp.dest('./dist'));
  });

  gulp.task('js', function() {
    gulp
      .src(jsFiles)
      .pipe(replace('mdl-', vendorPrefix + '-'))
      .pipe(replace('$$vendorName$$', vendor))
      .pipe(replace('$$mdlDepName$$', dependency))
      .pipe(rename(function(path) {
        path.dirname = '';
        path.basename = 'mdl-selectfield';
        path.extname = '.js';
      }))
      .pipe(gulp.dest('./dist'));
  });

  gulp.task('watch', function () {
    gulp.watch(sassFiles, ['sass', 'sass-compress']);
    gulp.watch(jsFiles, ['js', 'js-compress']);
  });

  gulp.task('build', ['sass', 'sass-compress', 'js', 'js-compress']);

  /**
   * Build encapsulated production files
   * The task accepts:
   * -v [VENDOR_NAME] parameter, default "Google"
   * -p [PREFIX] parameter, default is mdl
   * -d [DEPENDENCY] parameter, to be injected into the module, default is "encapsulated-mdl".
   * MDL is encapsulated inside window[vendor].mdl or exposed as cjs/amd module
   * If cjs/amd is not available, the global window[VENDOR_NAME].mdl.componentHandler is expected.
   */
  gulp.task('build:encap', function () {
      let i = process.argv.indexOf('-v');
      if (i > -1) {
          vendor = '"' + process.argv[i + 1] + '"';
      }
      i = process.argv.indexOf('-p');
      if (i > -1) {
          vendorPrefix = process.argv[i + 1];
      }
      i = process.argv.indexOf('-d');
      if (i > -1) {
          dependency = '"' + process.argv[i + 1] + '"';
      }
      runSequence(['build']);
  });

  // The default task (called when you run `gulp` from cli)
  gulp.task('default', ['watch']);

})();
