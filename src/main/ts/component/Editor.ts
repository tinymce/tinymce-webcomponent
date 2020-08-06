interface Window {
  tinymce: any;
}

enum Status {
  Raw,
  Initializing,
  Ready
}

const path = function (parts: string[]) {
  let o = window as any;
  for (let i = 0; i < parts.length && o !== undefined && o !== null; ++i) {
    o = o[parts[i]];
  }
  return o;
};

const resolveGlobal = function (p: string) {
  const parts = p.split('.');
  return path(parts);
};

const parseJsonResolveGlobals = (value: string): any => {
  try {
    return JSON.parse(value);
  } catch(e) { /* ignore */ }
  return resolveGlobal(value);
};

class TinyMceEditor extends HTMLElement {
  private _status: Status;
  private _shadowDom: ShadowRoot;
  private _editor: any;
  private _form: HTMLFormElement | null;

  static get formAssociated() {
    return true;
  }

  static get observedAttributes() {
    return ['disabled'];
  };

  constructor() {
    super();
    this._status = Status.Raw;
    this._shadowDom = this.attachShadow({mode:'open'});
    this._form = null;
  };

  private _formDataHandler = (evt: Event) => {
    const name = this.name;
    if (name !== null) {
      const data = (evt as any).formData as FormData;
      data.append(name, this.value);
    }
  }

  private _getTinyMCE () {
    return window.tinymce;
  };

  private _getConfig() {

    const config: Record<string, any> = {};
    for (let i = 0; i < this.attributes.length; i++) {
      const attr = this.attributes.item(i);
      if (attr !== null) {
        if (attr.name.startsWith('config-')) {
          // add to config
          const prop = attr.name.substr('config-'.length);
          config[prop] = parseJsonResolveGlobals(attr.value);
        }
      }
    }
    return config;
  }

  private _doInit(extraConfig: Record<string, any> = {}) {
    this._status = Status.Initializing;
    // load
    const target = document.createElement('textarea');
    target.value = this.innerHTML;
    this._shadowDom.appendChild(target);
    const baseConfig = {
      ...this._getConfig(),
      ...extraConfig,
    }
    const conf = {
      ...baseConfig,
      target,
      setup: (editor: any) => {
        this._editor = editor;
        editor.on('init', (e: unknown) => {
          this._status = Status.Ready;
        });
        if (baseConfig.setup) {
          baseConfig.setup(editor);
        }
      }
    };
    // use target
    this._getTinyMCE().init(conf);
  }

  attributeChangedCallback (attribute: string, oldValue: any, newValue: any) {
    // I was going to use this...
    if (newValue !== oldValue) {
      console.log('Changed attr: ', attribute);
    }
  };

  connectedCallback () {
    this._form = this.closest("form");
    if (this._form !== null) {
      this._form.addEventListener('formdata', this._formDataHandler);
    }
    if (this.getAttribute('init') !== 'false') {
      this._doInit();
    }
  }

  disconnectedCallback () {
    if (this._form !== null) {
      this._form.removeEventListener('formdata', this._formDataHandler);
      this._form = null;
    }
  }

  get value () {
    return this._status === Status.Ready ? this._editor.getContent() : undefined;
  };

  set value (newValue: string) {
    if (this._status === Status.Ready) {
      this._editor.setContent(newValue);
    }
  }

  get form() { return this._form; }
  get name() { return this.getAttribute('name'); }
  get type() { return this.localName; }


  public init (config: Record<string, any>) {
    if (this._status !== Status.Raw) {
      throw new Error('Already initialized');
    } else {
      this._doInit(config);
    }
  };
}

// export default TinyMceEditor;
customElements.define('tinymce-editor', TinyMceEditor);