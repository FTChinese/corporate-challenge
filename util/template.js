const path = require('path');
const nunjucks = require('nunjucks');
const markdown = require('nunjucks-markdown');
const marked = require('marked');
const renderer = new marked.Renderer();
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

class Template {
  constructor() {
    this.watch = false;
    this.noCache = true;
    this.autoescape = true;
    this.throwOnUndefined = false;
    this.trimBlocks = false;
    this.lstripBlocks = false;
  }

  get env() {
    const env = new nunjucks.Environment(
      new nunjucks.FileSystemLoader(
        [
          path.resolve(process.cwd(), 'views')
        ],
        {watch: this.watch, noCache: this.noCache}
      ),
      {
        autoescape: this.autoescape,
        throwOnUndefined: this.throwOnUndefined,
        trimBlocks: this.trimBlocks,
        lstripBlocks: this.lstripBlocks
      }
    );
    markdown.register(env, marked);
    return env;
  }

  render(template, context) {
    return new Promise((resolve, reject) => {
      this.env.render(template, context, function(err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
}
module.exports = new Template();