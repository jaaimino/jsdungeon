// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var connect = require('gulp-connect');
var header = require('gulp-header');

// Lint Task
gulp.task('lint', function() {
    return gulp.src('js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Add header data from package.json
var pkg = require('./package.json');
var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src([
        './src/jsdungeon.js', //Always load jsdungeon file first
        'src/**/*.js'
        ])
        .pipe(concat('jsdungeon.js'))
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(gulp.dest('dist'))
        .pipe(rename('jsdungeon.min.js'))
        .pipe(uglify())
        .pipe(header(banner, { pkg : pkg } ))
        .pipe(gulp.dest('dist'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('*.js', ['scripts']);
});

gulp.task('connect', function() {
  connect.server();
});

// Default Task
gulp.task('default', ['lint', 'scripts']);
//gulp.task('default', ['lint', scripts', 'watch']);