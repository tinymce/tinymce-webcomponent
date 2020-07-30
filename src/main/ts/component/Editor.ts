
interface Window {
  tinymce: any;
}

enum Status {
  Raw,
  Initializing,
  Ready
}

class TinyMceEditor extends HTMLElement {
  private status: Status;
  private shadowDom: ShadowRoot;
  private editor: any;
  private form_: HTMLFormElement | null;

  static get formAssociated() {
    return true;
  }

  static get observedAttributes() {
    return ['disabled'];
  };

  constructor() {
    super();
    this.status = Status.Raw;
    this.shadowDom = this.attachShadow({mode:'open'});
    this.form_ = null;
  };

  private formDataHandler = (evt: Event) => {
    const name = this.name;
    if (name !== null) {
      const data = (evt as any).formData as FormData;
      data.append(name, this.value);
    }
  }

  private getTinyMCE () {
    return window.tinymce;
  };

  private getConfig() {
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

  private doInit(extraConfig: Record<string, any> = {}) {
    this.status = Status.Initializing;
    // load
    const target = document.createElement('textarea');
    target.value = this.innerHTML;
    this.shadowDom.appendChild(target);
    const conf = {
      ...this.getConfig(),
      ...extraConfig,
      target,
      setup: (editor: any) => {
        this.editor = editor;
        editor.on('init', (e: unknown) => {
          this.status = Status.Ready;
        });
      }
    };
    // use target
    this.getTinyMCE().init(conf);
  }

  attributeChangedCallback (attribute: string, oldValue: any, newValue: any) {
    // I was going to use this...
    if (newValue !== oldValue) {
      console.log('Changed attr: ', attribute);
    }
  };

  connectedCallback () {
    this.form_ = this.closest("form");
    if (this.form_ !== null) {
      this.form_.addEventListener('formdata', this.formDataHandler);
    }
    if (this.getAttribute('init') !== 'false') {
      this.doInit();
    }
  }

  disconnectedCallback () {
    if (this.form_ !== null) {
      this.form_.removeEventListener('formdata', this.formDataHandler);
      this.form_ = null;
    }
  }

  get value () {
    return this.status === Status.Ready ? this.editor.getContent() : undefined;
  };

  set value (newValue: string) {
    if (this.status === Status.Ready) {
      this.editor.setContent(newValue);
    }
  }

  get form() { return this.form_; }
  get name() { return this.getAttribute('name'); }
  get type() { return this.localName; }


  public init (config: Record<string, any>) {
    if (this.status !== Status.Raw) {
      throw new Error('Already initialized');
    } else {
      this.doInit(config);
    }
  };
}

// export default TinyMceEditor;
customElements.define('tinymce-editor', TinyMceEditor);