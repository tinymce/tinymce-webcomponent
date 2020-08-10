var path = require('path');
const express = require('express');
const app = express();

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

const page = (post) => {
  return  `
  <!DOCTYPE html>
  <html>
    <head>
      <title>TinyMCE WebComponent Demo Page</title>
    </head>
    <body>
      <h3>Posted Content</h3>
      <div style="border: 1px solid black">${post}</div>
      <h3>Editor</h3>
      <tinymce-editor name="content" form="myform"></tinymce-editor>
      <h3>Form</h3>
      <form id="myform" method="POST" action="/">
        <input type="submit" value="Submit">
      </form>
      <script src="/tinymce/tinymce.js"></script>
      <script src="/dist/Editor.js"></script>
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
  response.send(page(""));
});

// Access the parse results as request.body
app.post('/', function(request, response) {
  response.send(page(request.body.content))
});

app.listen(3000, () => console.log('Listening on port 3000'));