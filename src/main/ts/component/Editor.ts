
interface Window {
  tinymce: any;
}

class TinyMceEditor extends HTMLElement {
  _initialized: boolean;
  _shadowDom: ShadowRoot;
  _target: Element;
  _editor: any;
  _form: HTMLFormElement | null;

  static get formAssociated() {
    return true;
  }

  static get observedAttributes() {
    return ['disabled'];
  };

  constructor() {
    super();
    this._initialized = false;
    this._shadowDom = this.attachShadow({mode:'open'});
    this._target = document.createElement('textarea');
    this._shadowDom.appendChild(this._target);
    this._form = null;
  };

  private formDataHandler = (evt: Event) => {
    const name = this.name;
    if (name !== null) {
      const data = (evt as any).formData as FormData;
      data.append(name, this.value);
    }
  }

  attributeChangedCallback (attribute: string, oldValue: any, newValue: any) {
    // I was going to use this...
    if (newValue !== oldValue) {
      console.log('Changed attr: ', attribute);
    }
  };

  connectedCallback () {
    this._form = this.closest("form");
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
          editor.on('init', (e: unknown) => {
            this._initialized = true;
            if (this._form !== null) {
              this._form.addEventListener('formdata', this.formDataHandler);
            }
          });
        }
      };
      console.log(conf);
      // use target
      this.getTinyMCE().init(conf);
    }
  }

  disconnectedCallback () {
    if (this._form !== null) {
      this._form.removeEventListener('formdata', this.formDataHandler);
      this._form = null;
    }
  }

  get value () {
    return this._initialized ? this._editor.getContent() : undefined;
  };

  set value (newValue: string) {
    if (this._initialized) {
      this._editor.setContent(newValue);
    }
  }

  get form() { return this._form; }
  get name() { return this.getAttribute('name'); }
  get type() { return this.localName; }

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
          editor.on('init', (e: unknown) => {
            this._initialized = true;
            if (this._form !== null) {
              this._form.addEventListener('formdata', this.formDataHandler);
            }
          });
        }
      };
      this.getTinyMCE().init(fullConfig);
    }
  };
}

// export default TinyMceEditor;
customElements.define('tinymce-editor', TinyMceEditor);