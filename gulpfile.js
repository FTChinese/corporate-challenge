const path = require('path');
const cssnext = require('postcss-cssnext');
const gulp = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss')
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const gm = require('gulp-gm');
const imagemin = require('gulp-imagemin');

const buildHTML = require('./util/build-page.js');
const buildES = require('./util/build-es.js');

const deployDir = '../ft-interact/';
const projectName = path.basename(__dirname);
const publicDir = 'public';

gulp.task('prod', function(done) {
  return Promise.resolve(process.env.NODE_ENV = 'production');
});

gulp.task('dev', function(done) {
  return Promise.resolve(process.env.NODE_ENV = 'development')
});

gulp.task('html', () => {
  return buildHTML()
    .then(() => {
      browserSync.reload('*.html');
      return Promise.resolve();
    })
    .catch(err => {
      console.log(err)
    })
})

gulp.task('styles', function styles() {
  const dest = `${publicDir}/styles`;

  return gulp.src('client/main.scss')
  .pipe(sourcemaps.init({loadMaps:true}))
  .pipe(sass({
    outputStyle: process.env.NODE_ENV === 'production' ? 'compressed' : 'expanded',
    precision: 10,
    includePaths: ['bower_components']
  }).on('error', (err) => {
    console.log(err);
  }))
  // .pipe(postcss([
  //   cssnext({
  //     features: {
  //       colorRgba: false
  //     }
  //   })
  // ]))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest(dest))
  .pipe(browserSync.stream({once:true}));
});


gulp.task('scripts', () => {
  return buildES('client/main.js', `${publicDir}/scripts/main.js`)
    .then(() => {
      browserSync.reload('*.html');
      return Promise.resolve();
    })
    .catch(err => {
      console.log(err);
    });
});

gulp.task('serve', 
  gulp.parallel(
    'html', 'styles', 'scripts', 

    function serve() {
    browserSync.init({
      server: {
        baseDir: ['public', 'client'],
        // list directories instead of opeing index.html
        directory: true,
        routes: {
          '/bower_components': 'bower_components'
        }
      },
      // watch files
      files: 'client/images/*.{png,jpg,gif}'
    });

    gulp.watch(['views/**/**', 'data/**/*.json'], gulp.parallel('html'));
    gulp.watch('client/**/*.js', gulp.parallel('scripts'));
    gulp.watch('client/scss/**/**/*.scss', gulp.parallel('styles'));
  })
);

/* build */

//crop image to 16:9 ratio and resize to 960px.
gulp.task('gm', () => {
  imgRatio = 9/16;

  return gulp.src('pic/*.*')
    .pipe(gm(function(gmfile, done) {
      console.log('Processing file: ', gmfile.source);
      gmfile.size(function(err, size) {
        if (size.width > size.height) {
          var w = size.width;
          var h = imgRatio * w;
          var y = (size.height - h) / 2;
          done(null, gmfile
            .crop(w, h, 0, y)
            .resize(960));
        } else {
          done(null, gmfile
            .resize(null, 540));
        }
      });
    }))
    .pipe(gulp.dest('.tmp'));
});

/**********deploy***********/

gulp.task('images', function () {
  const SRC = './client/images/**/*.{svg,png,jpg,jpeg,gif}' ;

  return gulp.src(SRC)
    .pipe(imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}],
      verbose: true
    }))
    .pipe(gulp.dest('public/images'));
});

gulp.task('copy', function() {
  const dest = path.resolve(__dirname, deployDir, projectName);
  console.log(`Copy from public dir to: ${dest}`);

  return gulp.src('public/**/**')
    .pipe(gulp.dest(dest));
});

gulp.task('build', gulp.series('prod', gulp.parallel('html', 'styles', 'scripts', 'images'), 'copy'));