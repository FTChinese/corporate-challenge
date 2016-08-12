const fs = require('fs');
const path = require('path');
const url = require('url');
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

function readFile(filename) {
  return new Promise(
    function(resolve, reject) {
      fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
          console.log('Cannot find file: ' + filename);
          reject(err);
        } else {
          resolve(data);
        }
      });
    }
  );
}

gulp.task('index', () => {
  const DEST = '.tmp';

  return gulp.src('views/index.njk')
    .pipe($.data(function() {
      return readFile('data/index.json')
        .then(function(value) {
           const viewData = JSON.parse(value);
           return viewData;
        });      
    }))
    .pipe($.nunjucks.compile())
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
      files: 'custom/**/*.{css,js,csv}'
    });

    gulp.watch(['views/**/*.njk', 'data/*.json'], gulp.parallel('index'));

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

gulp.task('prefix', () => {
  return gulp.src('.tmp/index.html')
    .pipe($.cheerio(function($, file) {
      $('picture source').each(function() {
        var source = $(this);
        var srcset = source.attr('srcset')
        if (srcset) {
          srcset = srcset.split(',').map(function(href) {
            return url.resolve(config.imgPrefix, href).replace('%20', ' ');
          }).join(', ');
          source.attr('srcset', srcset);
        }    
      });
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  const SRC = './public/images/' + projectName + '/*.{svg,png,jpg,jpeg,gif}' ;
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

// demos
gulp.task('html:demo', () => {
  console.log('Rename html to:', projectName, 'Copy all to: dist');
  return gulp.src('.tmp/**/*.{html,css,js,map}')
    .pipe($.if('index.html', $.rename({basename: projectName})))
    .pipe(gulp.dest('dist'));
});

// Build an index page listing all projects sent to test serve.


gulp.task('copy:demo', () => {
  const DEST = path.resolve(__dirname, config.assets, 'ig-template');
  console.log('Copy demo of', projectName, 'to', DEST);
  return gulp.src('dist/**/*.{html,js,css,map}')
    .pipe(gulp.dest(DEST));
});

gulp.task('demo', gulp.series('clean', gulp.parallel('index', 'styles', 'rollup', 'images'), 'html:demo', 'copy:demo'));
