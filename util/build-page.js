const path = require('path');
const loadJsonFile = require('load-json-file');
const fs = require('fs-jetpack');
const htmlMin = require('html-minifier').minify;
const tpl = require('./template.js');

const dataDir = path.resolve(__dirname, '../data');
const pagesDir = path.resolve(dataDir, 'pages');
const sharedDataFile = path.resolve(dataDir, 'shared.json');
const outDir = path.resolve(__dirname, '../public');

/**
 * Use the json data file to build an HTML file
 * The template file for nunjuck to use is specified
 * by the json file's `template` field.
 * The output html is named after the json file.
 * @param {String} fileName - the json file name
 */
async function buildPage(file, extraData={}) {
  const isProduction = process.env.NODE_ENV === 'production'
  const baseName = path.basename(file, '.json');
  console.log(`Loading json file: ${file}`);

  const data = await loadJsonFile(file);
  // Merge extraData with data from fileName
  const context = Object.assign(extraData, data);
  context.currentYear = (new Date()).getFullYear();
  console.log(context.currentYear);

  const templateFile = context.template;
  const outFile = path.resolve(outDir, `${baseName}.html`);

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

  await fs.writeAsync(outFile, html);
}

async function buildAllPages() {
  const sharedData = await loadJsonFile(sharedDataFile);
  // read all file names
  const promisedResults = fs.list(pagesDir)
  // Keep only those ending with `.json`
    .filter(name => name.endsWith('.json'))
  // Build all html files concurrently  
    .map(async (name) => {
      const filePath = path.resolve(pagesDir, name);
      return buildPage(filePath, sharedData);
    });
  // Wati all build to finish
  await Promise.all(promisedResults);
}

if (require.main === module) {
  // buildPage(path.resolve(pagesDir, 'index.json'))
  //   .catch(err => {
  //     console.log(err);
  //   });
  buildAllPages()
    .catch(err => {
      console.log(err);
    });
}

module.exports = buildAllPages;