/** 
*    Created on : Nov 2, 2017, 9:26:30 PM
*    @author Anurup Borah
*    
*    GULP Build Tool
*/

/**
 * Variable defined for various gulp library
 */
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var connect = require('gulp-connect');
var cleanCss = require('gulp-clean-css');
var gutil = require('gulp-util');
var compass= require('gulp-compass');
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');

/**
 * 
 * Variables defining where to store the CSS, JS, IMAGES and HTML
 */
var assets = "assets/"
var ignoreJs = './js/*.min.js';
var destCss = assets + "css";
var destJs = assets + "js";
var destImages = assets + "images";
var destHTML = "./";

// Lint Task - Not used because used inline with js minification below
//gulp.task('lint', function() {
//    return gulp.src('js/*.js')
//        .pipe(jshint())
//        .pipe(jshint.reporter('default'));
//});

/* Minify JS  with LINT Task */
gulp.task('minify-js', function() {
    return gulp.src(['js/*.js','!js/*.min.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(rename('all.min.js'))
        .pipe(gulp.dest(destJs))
        .pipe(connect.reload());
});

/* Minify HTML */
gulp.task('minify-html', function() {
  return gulp.src('./*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(destHTML))
    .pipe(connect.reload());
});


/* Minify Images */
gulp.task('minify-img',function() {
    gulp.src('./images/*')
    .pipe(imagemin())
    .pipe(gulp.dest(destImages))
});

/* Minify CSS */
gulp.task('minify-css', function() {
  return gulp.src('./css/*.css')
    .pipe(cleanCss({keepSpecialComments: false }))
    .pipe(gulp.dest(destCss))
    .pipe(connect.reload());
});
    
// Watch Files For Changes for JS and CSS
gulp.task('watch', function() {
    gulp.watch('js/*.js', ['minify-js']);
    gulp.watch('css/*.css', ['minify-css']);
});

/*Initiate the Gulp Module*/
gulp.task('default', function() {
  return gutil.log('Gulp is running!');
});

/* Liveload the Connect whenever any CSS or JS changed and saved.Browser automatically refreshes*/
gulp.task('connect', function() {
  connect.server();
});

/* Defined task to execute by Gulp*/
gulp.task('default', ['minify-css', 'minify-img' ,'minify-html' ,'minify-js','connect','watch']);