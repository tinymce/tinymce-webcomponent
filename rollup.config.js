const swag = require('@ephox/swag');

module.exports = {
  input: 'lib/main/ts/Main.js',
  output: {
    file: 'dist/tinymce-webcomponent.js',
    format: 'iife'
  },
  treeshake: true,
  onwarn: swag.onwarn,
  plugins: [
    swag.nodeResolve({
      basedir: __dirname,
      prefixes: {}
    }),
    swag.remapImports()
  ]
};