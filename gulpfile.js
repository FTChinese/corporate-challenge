const fs = require('fs');
const path = require('path');
const marked = require('marked');
const co = require('co');
const nunjucks = require('nunjucks');
const mdirp = require('mkdirp');
const helper = require('./helper');

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const del = require('del');
const cssnext = require('postcss-cssnext');
const $ = require('gulp-load-plugins')();
const rollup = require('rollup').rollup;
const buble = require('rollup-plugin-buble');
const bowerResolve = require('rollup-plugin-bower-resolve');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');
var cache;

const projectName = 'corporate-challenge';

gulp.task('index', () => {
  const DEST = '.tmp';
  const files = ['data/base.json', 'news/index.md'];
  return gulp.src('views/*.njk')
    .pipe($.plumber())
    .pipe($.data(function() {
      return Promise.all(files.map(helper.readFile))
        .then(function(value) {
          const base = JSON.parse(value[0]);
          const md = marked(value[1]);
          const data = helper.extend(base, {newsList: [md]});
          return data;
        }, function(err) {
          console.log(err);
        });      
    }))
    .pipe($.nunjucks.compile({}, {
      autoescape: false
    }))
    .pipe($.rename({
      extname: '.html'
    }))
    .pipe($.size({
      gzip: true,
      showFiles: true
    })) 
    .pipe(gulp.dest(DEST))
    .pipe(browserSync.stream({once:true}));
});

nunjucks.configure('views', {
  autoescape: false,
  watch: true,
  noCache: true
});

gulp.task('html', () => {

})

gulp.task('styles', function styles() {
  const DEST = '.tmp/styles';

  return gulp.src('client/scss/main.scss')
    .pipe($.changed(DEST))
    .pipe($.plumber())
    .pipe($.sourcemaps.init({loadMaps:true}))
    .pipe($.sass({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['bower_components']
    }).on('error', $.sass.logError))
    .pipe($.postcss([
      cssnext({
        features: {
          colorRgba: false
        }
      })
    ]))
    .pipe($.size({
      gzip: true,
      showFiles: true
    }))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(DEST))
    .pipe(browserSync.stream({once:true}));
});

gulp.task('eslint', () => {
  return gulp.src('client/js/*.js')
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
});

//crop image to 16:9 ratio and resize to 960px.
gulp.task('gm', () => {
  imgRatio = 9/16;

  return gulp.src('pic/*.jpg')
    .pipe($.gm(function(gmfile, done) {
      console.log('Processing file: ', gmfile.source);
      gmfile.size(function(err, size) {
        var w = size.width;
        var h = imgRatio * size.width;
        var y = (size.height - h) / 2;
        // var y = size.height - h;
        done(null, gmfile
          .crop(w, h, 0, y)
          .resize(960));
      });
    }))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('webpack', function(done) {
  const DEST = '.tmp/scripts/';
  return gulp.src('client/js/main.js')
    .pipe(webpackStream(webpackConfig, null, function(err, stats) {
      $.util.log(stats.toString({
          colors: $.util.colors.supportsColor,
          chunks: false,
          hash: false,
          version: false
      }));
      browserSync.reload({once: true});
    }))
    .pipe(gulp.dest(DEST));
});

gulp.task('serve', 
  gulp.parallel(
    'index', 'styles', 'webpack', 

    function serve() {
    browserSync.init({
      server: {
        baseDir: ['.tmp', 'public'],
        routes: {
          '/bower_components': 'bower_components'
        }
      },
      files: 'public/**/*.{png,jpg,gif}'
    });

    gulp.watch(['views/**/*.njk', 'data/*.json', 'news/**/*.md'], gulp.parallel('index'));

    gulp.watch('client/scss/**/**/*.scss', gulp.parallel('styles'));
  })
);

/* build */
// use rollup and buble to build js
gulp.task('rollup', () => {
  return rollup({
    entry: 'client/js/main.js',
    treeshake: false,
    plugins: [
      bowerResolve(),
      buble()
    ],
    cache: cache,
  }).then(function(bundle) {
    cache = bundle;

    return bundle.write({
      format: 'iife',
      // moduleName: 'Share',
      // moduleId: 'ftc-share',
      dest: '.tmp/scripts/main.js',
      sourceMap: true,
    });
  });
});


gulp.task('images', function () {
  const SRC = './public/images/*.{svg,png,jpg,jpeg,gif}' ;
  const DEST = path.resolve(__dirname, config.assets, 'images', projectName);
  console.log('Copying images to:', DEST);

  return gulp.src(SRC)
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}],
      verbose: true
    }))
    .pipe(gulp.dest(DEST));
});

gulp.task('clean', function() {
  return del(['.tmp', 'dist']).then(()=>{
    console.log('.tmp and dist deleted');
  });
});

gulp.task('build', gulp.series('clean', gulp.parallel('index', 'styles', 'rollup', 'images')));

/**********deploy***********/
gulp.task('deploy:html', function() {
  const DEST = path.resolve(__dirname, config.html)
  console.log('Deploying built html file to:', DEST);
  return gulp.src('dist/index.html')
    .pipe($.prefix(config.imgPrefix))
    .pipe($.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      minifyJS: true,
      minifyCSS: true
    }))
    .pipe($.size({
      gzip: true,
      showFiles: true
    }))
    .pipe(gulp.dest(DEST));
});

gulp.task('deploy', gulp.series('build', 'deploy:html'));



