const fs = require('fs');
const path = require('path');
const marked = require('marked');
const isThere = require('is-there');
const co = require('co');
const nunjucks = require('nunjucks');
const mkdirp = require('mkdirp');
const helper = require('./helper');

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const del = require('del');
const cssnext = require('postcss-cssnext');
const $ = require('gulp-load-plugins')();
const rollup = require('rollup').rollup;
const buble = require('rollup-plugin-buble');
const bowerResolve = require('rollup-plugin-bower-resolve');
const uglify = require('rollup-plugin-uglify');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

const deployDir = '../ft-interact/';
var cache;

process.env.NODE_ENV = 'dev';

const projectName = 'corporate-challenge';

renderer = new marked.Renderer();
renderer.heading = function(text, level) {
  var className = '';
  switch (level) {
    case 3:
      className = 'article__stand-first'
      break;
    case 4:
      className = 'article__subheading';
      break;
    default:
      className = 'article__title';
  }

    return `<h${level} class="${className}">${text}</h${level}>`
}

marked.setOptions({
  renderer: renderer
});

nunjucks.configure('views', {
  autoescape: false,
  // watch: true,
  noCache: true
});

gulp.task('prod', function(done) {
  process.env.NODE_ENV = 'prod';
  done();
});

gulp.task('html', () => {
  return co(function *() {
    const files = ['data/base.json', 'data/news-list.json'];
    const destDir = '.tmp';

    const destExists = isThere(destDir);
    if (!destExists) {
      mkdirp(destDir, (err) => {
        if (err) console.log(err);
      });
    }

    const [base, news] = yield Promise.all(files.map(helper.readJSON));
    
    for (let name in news) {
      const fileData = news[name];

      var tplFile = '';
      if (name === 'index') {
        tplFile = 'index.njk';
      } else {
        tplFile = 'news.njk';
      }

      const htmlPath = path.resolve('.tmp', name + '.html');
      const mdArr = yield Promise.all(fileData.newsList.map(helper.readMd));
  // base is an object reference, so you need to override its.
  // is it better to clone the object?
      const context = helper.extend(base, helper.extend(fileData, {newsList: mdArr}));
      
      const res = nunjucks.render(tplFile, context);
      
      const ws = fs.createWriteStream(htmlPath);
      ws.write(res);
      ws.on('error', (error) => {
        console.log(error);
      });
    }
    return;
  }).then(function (value) {
    // console.log(value);
    browserSync.reload({once: true});
  }, function(err) {
    console.log(err.stack);
  });
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
    .pipe($.if(process.env.NODE_ENV === 'prod', $.cssnano()))
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

gulp.task('webpack', (done) => {
// change webpack config if env is production.
  if (process.env.NODE_ENV === 'prod') {
    delete webpackConfig.watch;
    webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin())
  }
  webpack(webpackConfig, function(err, stats) {
    if (err) throw new $.util.PluginError('webpack', err);
    $.util.log('[webpack]', stats.toString({
      colors: $.util.colors.supportsColor,
      chunks: false,
      hash: false,
      version: false
    }))
    browserSync.reload({once: true});
    done();
  });
});

gulp.task('serve', 
  gulp.parallel(
    'html', 'styles', 'webpack', 

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

    gulp.watch(['views/**/*.njk', 'data/*.json', 'news/**/*.md'], gulp.parallel('html'));

    gulp.watch('client/scss/**/**/*.scss', gulp.parallel('styles'));
  })
);

/* build */

// use rollup and buble to build js
gulp.task('rollup', () => {
  return rollup({
    entry: 'client/js/main.js',
    plugins: [
      bowerResolve(),
      buble(),
      uglify()
    ],
    cache: cache,
  }).then(function(bundle) {
    cache = bundle;

    return bundle.write({
      format: 'iife',
      dest: '.tmp/scripts/main.js',
      sourceMap: true,
    });
  });
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


gulp.task('images', function () {
  const SRC = './public/images/**/*.{svg,png,jpg,jpeg,gif}' ;
  const DEST = path.resolve(__dirname, deployDir, projectName, 'images');
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

/**********deploy***********/
gulp.task('dist', function() {

  return gulp.src('.tmp/**/*.*')
    .pipe($.if('*.html', 
      $.htmlmin({
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
      })
    ))
    .pipe($.size({
      gzip: true,
      showFiles: true
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', gulp.series('clean', 'prod', gulp.parallel('html', 'styles', 'webpack'), 'dist'));

gulp.task('serve:dist', () => {
  browserSync.init({
    server: {
      baseDir: ['dist', 'public'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });
});

gulp.task('copy', () => {
  const DEST = path.resolve(__dirname, deployDir, projectName);
  console.log('Deploying to: ', DEST);
  return gulp.src('dist/**/*.*')
    .pipe(gulp.dest(DEST));
});

gulp.task('deploy', gulp.series('build', 'copy', 'images'));