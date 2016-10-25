const fs = require('mz/fs');
const path = require('path');
const marked = require('marked');
const isThere = require('is-there');
const co = require('co');
const mkdirp = require('mkdirp');
const helper = require('./helper');

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const del = require('del');
const cssnext = require('postcss-cssnext');
const $ = require('gulp-load-plugins')();

const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

const deployDir = '../ft-interact/';
const projectName = 'corporate-challenge';
const tmpDir = '.tmp';

process.env.NODE_ENV = 'dev';

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


gulp.task('prod', function(done) {
  process.env.NODE_ENV = 'prod';
  done();
});

gulp.task('dev', function(done) {
  process.env.NODE_ENV = 'dev';
  done();
});

gulp.task('html', () => {
  return co(function *() {
    const dataFiles = ['base.json', 'page-list.json'];

    if (!isThere(tmpDir)) {
      mkdirp.sync(tmpDir);
    }

    const [base, pages] = yield Promise.all(dataFiles.map(file => {
      const filePath = path.resolve(process.cwd(), `data/${file}`);
      return helper.readJson(filePath);
    }));
// array of previous event links.
    base.previousEvents = [];
// read mardown files listed in page.newsList
// Use the read content to replace the original file name array. 
    for (let page of pages) {
      if (page.newsList) {
        const newsContent = yield Promise.all(page.newsList.map(file => {
          return helper.readMd(file);
        }));
        page.newsList = newsContent;
      }
// each thumbnail should have a link pointing to itself.
      if (page.thumbnail) {
        page.thumbnail.link = `${page.name}.html`;
        base.previousEvents.push(page.thumbnail);
      }
    }

// data are ready to be used 
    const renderResults = yield Promise.all(pages.map(function(page) {

      const template = path.basename(page.template);
      console.log(`Using template "${template}" for "${page.name}"`);
// merge each page content with base.
      const context = Object.assign(page, base);

      if (process.env.NODE_ENV === 'prod') {
        context.production = true;
      } 

      return helper.render(template, context, page.name);
    }));
// write the rendered string to file
    yield Promise.all(renderResults.map(result => {
      return fs.writeFile(`${tmpDir}/${result.name}.html`, result.content, 'utf8');
    }));

  }).then(function () {
    browserSync.reload('*.html');
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

gulp.task('clean', function() {
  return del(['.tmp', 'dist']).then(()=>{
    console.log('.tmp and dist deleted');
  });
});

/* build */

//crop image to 16:9 ratio and resize to 960px.
gulp.task('gm', () => {
  imgRatio = 9/16;

  return gulp.src('pic/*.jpg')
    .pipe($.gm(function(gmfile, done) {
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

gulp.task('copy', function() {
  const DEST = path.resolve(__dirname, deployDir, projectName);
  console.log(`Copy .tmp dir to: ${DEST}`);

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
    .pipe(gulp.dest(DEST));
});

gulp.task('build', gulp.series('clean', 'prod', gulp.parallel('html', 'styles', 'webpack'), 'dev'));

gulp.task('deploy', gulp.series('build', 'copy', 'images'));