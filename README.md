
# Official TinyMCE Web Component

Web Components are a set of built-in browser capabilities that let developers create custom HTML elements in a similar manner to what is available in frameworks like React or Angular.

Web Components comprise 3 basic capabilities:
- Shadow DOM
- Custom Elements
- HTML Templating

Shadow DOM provides the ability to create a "sandboxed" area of a web page, in a similar manner to iframes. An HTML element can have a "shadow root" attached to it, which is a tree of elements that are separate to the main document. Shadow roots are useful for having an area of the document that doesn't inherit styles from the main document. This is particularly handy for rich components like TinyMCE which have their own complex stylesheets and have to fit into any of our customer's web apps. 

Custom Elements allow a developer to register a new tag/element that can be included in the HTML of the page. The custom element's behaviour is defined in JavaScript code and then registered for use in HTML.
TinyMCE for Web Components provides the Custom Element, building on the experimental Shadow DOM support added in TinyMCE 5.4. 

Once the TinyMCE custom element is installed on a web page, creating an editor instance is as simple as adding a `<tinymce-editor></tinymce-editor>` tag to the page. This tag is used in place of calling tinymce.init(). Many of the standard configuration properties can be specified as attributes to this tag, instead of using JavaScript code.

TinyMCE for Web Components is available for free under an Apache 2.0 license, and can be installed via NPM. It is compatible with open source TinyMCE, Tiny Cloud, and TinyMCE commercial self-hosted offerings. 
At this stage, TinyMCE for Web Components is an experimental integration - we would love to hear your [feedback](https://github.com/tinymce/tinymce-webcomponent/issues) on how it can be improved.
