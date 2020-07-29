
interface Window {
  tinymce: any;
}

class TinyMceEditor extends HTMLElement {
  _initialized: boolean;
  _shadowDom: ShadowRoot;
  _target: Element;
  _editor: any;

  static get observedAttributes() {
    return ['disabled'];
  };

  constructor() {
    super();
    this._initialized = false;
    this._shadowDom = this.attachShadow({mode:'open'});
    this._target = document.createElement('textarea');
    this._shadowDom.appendChild(this._target);
  };

  attributeChangedCallback (attribute: string, oldValue: any, newValue: any) {
    // I was going to use this...
    if (newValue !== oldValue) {
      console.log('Changed attr: ', attribute);
    }
  };

  connectedCallback () {
    // TBD
    if (this.getAttribute('init') === 'false') {
      // don't load yet?
    } else {
      // load
      const conf = {
        ...this.getConfig(),
        target: this._target,
        setup: (editor: any) => {
          this._editor = editor;
          editor.on('init', (e: any) => {
            this._initialized = true;
          });
        }
      };
      console.log(conf);
      // use target
      this.getTinyMCE().init(conf);
    }
  }

  disconnectedCallback () {
    // TBD
  }

  get value () {
    return this._initialized ? this._editor.getContent() : undefined;
  };

  set value (newValue: string) {
    if (this._initialized) {
      this._editor.setContent(newValue);
    }
  }

  getTinyMCE () {
    return window.tinymce;
  };

  getConfig () {
    const config: {[key: string]: string | Element} = {};
    console.log(this.attributes);
    for (let i = 0; i < this.attributes.length; i++) {
      const attr = this.attributes.item(i);
      if (attr?.name.startsWith('config-')) {
        // add to config
        const prop = attr.name.substr('config-'.length);
        config[prop] = attr.value;
      }
    }
    return config;
  }

  init (config: {[key: string]: any}) {
    if (this._initialized) {
      throw 'Already initialized';
    } else {
      const fullConfig = {
        ...config,
        ...this.getConfig(),
        target: this._target,
        setup: (editor: any) => {
          this._editor = editor;
          editor.on('init', (e: any) => {
            this._initialized = true;
          });
        }
      };
      this.getTinyMCE().init(fullConfig);
    }
  };
}

// export default TinyMceEditor;
customElements.define('tinymce-editor', TinyMceEditor);