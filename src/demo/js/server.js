var path = require('path');
const express = require('express');
const app = express();

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

/**
 * Encode XML entities 
 * @param {string} value the value
 * @return {string} the value with the main HTML entities encoded.
 */
const encodeHtmlEntities = (value) => {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
};

/**
 * Generate some HTML for display.
 * @param {string} editor1Value the value of the first editor.
 * @param {string} editor2Value the value of the second editor.
 * @return {string} the page HTML.
 */
const page = (editor1Value, editor2Value) => {
  return  `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <title>TinyMCE WebComponent Form Demo Page</title>
      <link rel="icon" href="data:;base64,iVBORw0KGgo=">
    </head>
    <body>
      <h1>TinyMCE WebComponent in Form</h1>
      <h2>Editor 1 (outside form with form attribute)</h2>
      <tinymce-editor name="editor1" form="myform">${encodeHtmlEntities(editor1Value)}</tinymce-editor>
      <h2>Editor 2 (inside form)</h2>
      <form id="myform" method="POST" action="/">
        <tinymce-editor name="editor2">${encodeHtmlEntities(editor2Value)}</tinymce-editor>
        <input type="submit" value="Submit">
      </form>
      <h2>Posted Content</h2>
      <h3>Editor 1 value</h3>
      <div style="border: 1px solid black">${editor1Value}</div>
      <h3>Editor 2 value</h3>
      <div style="border: 1px solid black">${editor2Value}</div>
      <script src="/tinymce/tinymce.js"></script>
      <script src="/dist/tinymce-webcomponent.js"></script>
    </body>
  </html>
  `;
};

const tinyPath = path.normalize(path.join(__dirname, '..', '..', '..', 'node_modules', 'tinymce'));
const distPath = path.normalize(path.join(__dirname, '..', '..', '..', 'dist'))
console.log("Serving /tinymce from: " + tinyPath);
console.log("Serving /dist from: " + distPath);

app.use('/tinymce', express.static(tinyPath));
app.use('/dist', express.static(distPath));

app.get('/', function(request, response) {
  response.send(page("", ""));
});

// Access the parse results as request.body
app.post('/', function(request, response) {
  response.send(page(request.body.editor1, request.body.editor2))
});

app.listen(3000, () => console.log('http://localhost:3000/'));