const swag = require('@ephox/swag');

export default {
  input: 'lib/main/ts/component/Editor.js',
  output: {
    file: 'dist/tinymce-wc.js',
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