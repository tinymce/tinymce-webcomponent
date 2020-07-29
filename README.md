
# TinyMCE Web Component

Demo for WebComponent spike

## Web Components

Web components are custom reusable widgets that can work across modern browsers and can be used with any JS library.

### Custom element lifecycle hooks:

- `constructor`: Initialize element state
- `connectedCallback`: Called when the element is inserted into the DOM
- `disconnectedCallback`: Called when the element is removed from the DOM
- `attributeChangedCallback`: Called when an attribute, specified as an `observedAttribute` is added, removed or updated.
- `adoptedCallback`: Called when the element has been moved into a new document

### Caveats

I have to set `target` to es6 to avoid issues with transpiling not calling `new` for extended elements. This link should shed some light on the issue: [extending HtmlElement constructor fails](https://stackoverflow.com/questions/39037489/extending-htmlelement-constructor-fails-when-webpack-was-used)