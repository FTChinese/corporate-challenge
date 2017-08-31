const path = require('path');
const loadJsonFile = require('load-json-file');
const fs = require('fs-jetpack');
const htmlMin = require('html-minifier').minify;
const tpl = require('./template.js');
const publicDir = 'public';

/**
 * Use the json data file to build an HTML file
 * The template file for nunjuck to use is specified
 * by the json file's `template` field.
 * The output html is named after the json file.
 * @param {String} fileName - the json file name
 */
async function buildPage(fileName) {
  const isProduction = process.env.NODE_ENV === 'production'
  const dataFile = path.resolve(__dirname, `../data/${fileName}`);
  const baseName = path.basename(fileName, '.json');
  console.log(`Loading json file: ${dataFile}`);

  const context = await loadJsonFile(dataFile);
  const templateFile = context.template;
  const destFile = path.resolve(__dirname, `../public/${baseName}.html`);

  let html = await tpl.render(templateFile, context);

  if (isProduction) {
    html = htmlMin(html, {
      collapseBooleanAttributes: true,
      collapseInlineTagWhitespace: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true
    });
  }

  await fs.writeAsync(destFile, html);
}

if (require.main === module) {
  buildPage('index.json')
    .catch(err => {
      console.log(err);
    });
}

module.exports = buildPage;