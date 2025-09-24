import * as path from 'path';
import express from 'express';

const app = express();

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

/**
 * Encode XML entities
 * @param {string} value the value
 * @return {string} the value with the main HTML entities encoded.
 */
const encodeHtmlEntities = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Generate some HTML for display.
 * @param {string} editor1Value the value of the first editor.
 * @param {string} editor2Value the value of the second editor.
 * @return {string} the page HTML.
 */
const page = (editor1Value: string, editor2Value: string, editor3Value: string, editor4Value: string) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8"/>
      <title>TinyMCE WebComponent Form Demo Page</title>
      <link rel="icon" href="data:;base64,iVBORw0KGgo=">
      <script>
      class TinyMceEditorNested extends HTMLElement {
        connectedCallback() {
          const count = parseInt(this.getAttribute('nested') || '1', 10);
          const content = this.getAttribute('value');
          const shadow = this.attachShadow({ mode: 'open' });
          const target = document.createElement('tinymce-editor' + (count > 1 ? '-nested' : ''));
          [...this.attributes].forEach( attr => { target.setAttribute(attr.nodeName, attr.nodeValue) });
          target.setAttribute('nested', count - 1);
          target.appendChild(document.createTextNode(content));
          shadow.appendChild(target);
        }
      }
      window.customElements.define('tinymce-editor-nested', TinyMceEditorNested);
      </script>
    </head>
    <body>
      <h1>TinyMCE WebComponent in Form</h1>
      <h2>Editor 1 (outside form with form attribute)</h2>
      <tinymce-editor name="editor1" form="myform">${encodeHtmlEntities(editor1Value)}</tinymce-editor>
      <h2>Editor 2 (nested in shadow dom, outside form with form attribute)</h2>
      <tinymce-editor-nested nested="2" name="editor2" form="myform" value="${encodeHtmlEntities(editor2Value)}"></tinymce-editor-nested>
      <form id="myform" method="POST" action="/">
        <h2>Editor 3 (inside form)</h2>
        <tinymce-editor name="editor3">${encodeHtmlEntities(editor3Value)}</tinymce-editor>
        <h2>Editor 4 (nested in shadow dom, inside form)</h2>
        <tinymce-editor-nested nested="2" name="editor4" value="${encodeHtmlEntities(editor4Value)}"></tinymce-editor-nested>
        <input type="submit" value="Submit">
      </form>

      <h2>Posted Content</h2>
      <h3>Editor 1 value</h3>
      <div style="border: 1px solid black">${editor1Value}</div>
      <h3>Editor 2 value</h3>
      <div style="border: 1px solid black">${editor2Value}</div>
      <h3>Editor 3 value</h3>
      <div style="border: 1px solid black">${editor3Value}</div>
      <h3>Editor 4 value</h3>
      <div style="border: 1px solid black">${editor4Value}</div>
      <script src="/tinymce/tinymce.js"></script>
      <script src="/dist/tinymce-webcomponent.js"></script>
    </body>
  </html>
  `;

const tinyPath = path.normalize(path.join(__dirname, '..', '..', '..', 'node_modules', 'tinymce'));
const distPath = path.normalize(path.join(__dirname, '..', '..', '..', 'dist'));

/* eslint-disable-next-line no-console */
console.log('Serving /tinymce from: ' + tinyPath);
/* eslint-disable-next-line no-console */
console.log('Serving /dist from: ' + distPath);

app.use('/tinymce', express.static(tinyPath));
app.use('/dist', express.static(distPath));

app.get('/', (request, response) => {
  response.send(page('', '', '', ''));
});

// Access the parse results as request.body
app.post('/', (request, response) => {
  response.send(page(request.body.editor1 as string, request.body.editor2 as string, request.body.editor3 as string, request.body.editor4 as string));
});

/* eslint-disable-next-line no-console */
app.listen(3000, () => console.log('http://localhost:3000/'));