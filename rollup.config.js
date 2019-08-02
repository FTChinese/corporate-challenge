import minify from "rollup-plugin-babel-minify";
import babel from "rollup-plugin-babel";
import bowerResolve from "rollup-plugin-bower-resolve";

export default {
  input: 'client/main.js',
  plugins: [
    bowerResolve(),
    babel({
      exclude: 'node_modules/**'
    }),
    minify()
  ],
  output: {
    file: 'public/scripts/main.js',
    format: 'iife',
  }
};