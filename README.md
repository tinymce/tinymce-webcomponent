# Official Web Component for TinyMCE

## About

Official Web Component for TinyMCE, the rich text editor. It wraps TinyMCE as a `<tinymce-editor>` custom element, used in place of calling `tinymce.init()`. By default, it pulls TinyMCE from the Tiny Cloud CDN unless configured to use a different setup, such as self-hosting the [tinymce NPM package](https://www.npmjs.com/package/tinymce).

Many of the standard configuration properties can be specified as attributes on the `<tinymce-editor>` tag, instead of using JavaScript code.

## Quickstart

### Cloud CDN

1. [Sign up for a Tiny Cloud account](https://www.tiny.cloud/pricing/) to receive a Tiny Cloud API key.
1. Then in your project:
    1. Include the following script tag to load the Web Component from the CDN:

        ```html
        <script src="https://cdn.jsdelivr.net/npm/@tinymce/tinymce-webcomponent/dist/tinymce-webcomponent.min.js"></script>
        ```
    1. Add the `tinymce-editor` element with your API key and configuration as HTML attributes:

        ```html
        <tinymce-editor
          api-key="your-api-key"
          plugins="lists link image table code help wordcount"
        >
          <p>Welcome to TinyMCE</p>
        </tinymce-editor>
        ```
    1. Update the `api-key` attribute to include your Tiny Cloud API key.

For more information: [Using TinyMCE with Web Components - Cloud CDN](https://www.tiny.cloud/docs/tinymce/latest/webcomponent-cloud/)

### Self hosted via NPM package

Using TinyMCE from NPM with the Web Component requires a couple of extra steps. See the documentation for more information: [Using TinyMCE with Web Components - Self hosted via NPM](https://www.tiny.cloud/docs/tinymce/latest/webcomponent-pm/)

## Detailed documentation

* [TinyMCE Web Component Technical Reference](https://www.tiny.cloud/docs/tinymce/latest/webcomponent-ref/).
* [TinyMCE Documentation](https://www.tiny.cloud/docs/tinymce/latest/).

## Issues

Have you found an issue with `tinymce-webcomponent` or do you have a feature request? Open up an [issue](https://github.com/tinymce/tinymce-webcomponent/issues) and let us know or submit a [pull request](https://github.com/tinymce/tinymce-webcomponent/pulls). *Note: for issues concerning TinyMCE please visit the [TinyMCE repository](https://github.com/tinymce/tinymce).*

## License

`tinymce-webcomponent` is licensed under the MIT License. See the LICENSE.txt file for details.

Depending on use case, the TinyMCE core editor can be used under either GPL-2.0-or-later or a commercial license. See the [tinymce package](https://www.npmjs.com/package/tinymce) for details.
