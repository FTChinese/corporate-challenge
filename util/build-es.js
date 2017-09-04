const path = require('path');
const rollup = require('rollup');
const bowerResolve = require('rollup-plugin-bower-resolve');
const babili = require('rollup-plugin-babili');
const babel = require('rollup-plugin-babel');

let cache;
async function build(input, output) {
  const inputOptions = {
    input: path.resolve(process.cwd(), input),
    plugins: [
      bowerResolve(),
      babel({
        exclude: 'node_modules/**'
      })
    ],
    cache: cache
  };
  if (process.env.NODE_ENV === 'production') {
    inputOptions.plugins.push(babili());
  }
  const outputOptions = {
    file: path.resolve(process.cwd(), output),
    format: 'iife',
    sourcemap: true
  };
  const bundle = await rollup.rollup(inputOptions);

  await bundle.write(outputOptions);
}

module.exports = build;