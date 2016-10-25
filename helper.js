const fs = require('fs');
const path = require('path');
const nunjucks = require('nunjucks');
const marked = require('marked');

var env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(
    [
      path.resolve(process.cwd(), 'views'),
    ],
    {noCache: true}
  ),
  {autoescape: false}
);

function render(template, context, name) {
  return new Promise(function(resolve, reject) {
    env.render(template, context, function(err, result) {
      if (err) {
        reject(err);
      } else {
        if (name) {
          resolve({
            name: name,
            content: result
          });          
        } else {
          resolve(result);
        }
      }
    });
  });
}

function readJson(filename) {
  return new Promise(
    function(resolve, reject) {
      fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
          console.log('Cannot find file: ' + filename);
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      });
    }
  );
}

function readMd(filename) {
  return new Promise(
    function(resolve, reject) {
      fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
          console.log('Cannot find file: ' + filename);
          reject(err);
        } else {
          resolve(marked(data));
        }
      });
    }
  );
}

module.exports = {
  render: render,
  readJson: readJson,
  readMd: readMd
};