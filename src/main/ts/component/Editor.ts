interface Window {
  tinymce: any;
}

enum Status {
  Raw,
  Initializing,
  Ready
}

const objHas = function(obj: object, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
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

const identity = <T> (a: T): T => a;

const numberOrString = (value: string) => /^\d+$/.test(value) ? Number.parseInt(value, 10) : value

const lookup = (values: Record<string, any>) => (key: string) => objHas(values, key) ? values[key] : key;

const configAttributes: Record<string, (v: string) => unknown> = {
  toolbar: lookup({ 'false': false }), // string or false
  menubar: lookup({ 'false': false }), // string or false
  plugins: identity, // string
  content_css: identity, // 'default', 'dark', 'document', 'writer', or a path to a css file
  content_style: identity, // string
  width: numberOrString, // integer or string
  height: numberOrString, // integer or string
  toolbar_mode: identity, // 'floating', 'sliding', 'scrolling', or 'wrap'
  contextmenu: lookup({ 'false': false }), // string or false
  quickbars_insert_toolbar: lookup({ 'false': false }), // string or false
  quickbars_selection_toolbar: lookup({ 'false': false }), // string or false
  powerpaste_word_import: identity, // 'clean', 'merge', or 'prompt'
  powerpaste_html_import: identity, // 'clean', 'merge', or 'prompt'
  powerpaste_allow_local_images: lookup({ 'true': true, 'false': false }), // boolean
  resize: lookup({ 'true': true, 'false': false, 'both': 'both' }), // boolean or 'both'
  setup: resolveGlobal // function
};

const configRenames: Record<string, string> = {
};

class TinyMceEditor extends HTMLElement {
  private _status: Status;
  private _shadowDom: ShadowRoot;
  private _editor: any;
  private _form: HTMLFormElement | null;
  private _eventHandlers: Record<string, any>;
  private _mutationObserver: MutationObserver;

  static get formAssociated() {
    return true;
  }

  static get observedAttributes() {
    const nativeEvents = ['onBeforePaste', 'onBlur', 'onClick', 'onContextMenu',
     'onCopy', 'onCut', 'onDblclick', 'onDrag', 'onDragDrop', 'onDragEnd',
     'onDragGesture', 'onDragOver', 'onDrop', 'onFocus', 'onFocusIn',
     'onFocusOut', 'onKeyDown', 'onKeyPress', 'onKeyUp', 'onMouseDown',
     'onMouseEnter', 'onMouseLeave', 'onMouseMove', 'onMouseOut', 'onMouseOver',
     'onMouseUp', 'onPaste', 'onSelectionChange'];
    const tinyEvents = ['onActivate', 'onAddUndo', 'onBeforeAddUndo',
     'onBeforeExecCommand', 'onBeforeGetContent', 'onBeforeRenderUI',
     'onBeforeSetContent', 'onChange', 'onClearUndos', 'onDeactivate',
     'onDirty', 'onExecCommand', 'onGetContent', 'onHide', 'onInit',
     'onLoadContent', 'onNodeChange', 'onPostProcess', 'onPostRender',
     'onPreProcess', 'onProgressState', 'onRedo', 'onRemove', 'onReset',
     'onSaveContent', 'onSetAttrib', 'onObjectResizeStart', 'onObjectResized',
     'onObjectSelected', 'onSetContent', 'onShow', 'onSubmit', 'onUndo',
     'onVisualAid'];

    return ['form', 'readonly', 'autofocus', 'placeholder'].concat(nativeEvents).concat(tinyEvents);
  };

  constructor() {
    super();
    this._status = Status.Raw;
    this._shadowDom = this.attachShadow({mode:'open'});
    this._form = null;
    this._eventHandlers = {};
    this._mutationObserver = new MutationObserver(this._eventAttrHandler);
  };

  private _eventAttrHandler: MutationCallback = (records) => {
    records.forEach((record) => {
      if (record.type === 'attributes' && record.target === this && record.attributeName?.toLowerCase().startsWith('on')) {
        this._updateEventAttr(record.attributeName, this.getAttribute(record.attributeName));
      }
    });
  }

  private _formDataHandler = (evt: Event) => {
    const name = this.name;
    if (name !== null) {
      const data = (evt as any).formData as FormData;
      data.append(name, this.value);
    }
  }

  private _updateEventAttr (attrKey: string, attrValue: string | null) {
    const event = attrKey.substring('on'.length).toLowerCase();
    const handler = attrValue !== null ? resolveGlobal(attrValue) : undefined;
    if (this._eventHandlers[event] !== handler) {
      if (this._editor && this._eventHandlers[event]) {
        this._editor.off(event, this._eventHandlers[event]);
      }
      if (handler) {
        if (this._editor) {
          this._editor.on(event, handler);
        }
        this._eventHandlers[event] = handler;
      } else {
        delete this._eventHandlers[event];
      }
    }
  }

  private _updateForm () {
    if (this.isConnected) {
      const formId = this.getAttribute('form');
      const form = formId !== null ? this.ownerDocument.querySelector<HTMLFormElement>('form#' +formId) : this.closest('form');
      if (this._form !== form) {
        if (this._form !== null) {
          this._form.removeEventListener('formdata', this._formDataHandler);
        }
        this._form = form;
        if (this._form !== null) {
          this._form.addEventListener('formdata', this._formDataHandler);
        }
      }
    } else {
      if (this._form !== null) {
        this._form.removeEventListener('formdata', this._formDataHandler);
        this._form = null;
      }
    }
  }

  private _getTinyMCE () {
    return window.tinymce;
  };

  private _getConfig() {

    const config: Record<string, unknown> = {};
    for (let i = 0; i < this.attributes.length; i++) {
      const attr = this.attributes.item(i);
      if (attr !== null) {
        if (attr.name.startsWith('config-')) {
          // add to config
          const prop = attr.name.substr('config-'.length);
          config[prop] = parseJsonResolveGlobals(attr.value);
        } else if (objHas(configAttributes, attr.name)) {
          const prop = objHas(configRenames, attr.name) ? configRenames[attr.name] : attr.name;
          config[prop] = configAttributes[attr.name](attr.value);
        }
      }
    }
    if (this.readonly) {
      config.readonly = true;
    }
    if (this.autofocus) {
      config['auto_focus'] = true;
    }
    return config;
  }

  private _getEventHandlers() {
    const handlers: Record<string, any> = {};
    for (let i = 0; i < this.attributes.length; i++) {
      const attr = this.attributes.item(i);
      if (attr !== null) {
        if (attr.name.toLowerCase().startsWith('on')) {
          const event = attr.name.toLowerCase().substr('on'.length);
          const handler = resolveGlobal(attr.value);
          handlers[event] = handler;
        }
      }
    }
    return handlers;
  }

  private _doInit(extraConfig: Record<string, unknown> = {}) {
    this._status = Status.Initializing;
    // load
    const target = document.createElement('textarea');
    target.value = this.innerHTML;
    if (this.placeholder !== null) {
      target.placeholder = this.placeholder;
    }
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
        editor.on('SwitchMode', (e: unknown) => {
          // this assignment ensures the attribute is in sync with the editor
          this.readonly = this.readonly;
        });
        Object.keys(this._eventHandlers).forEach((event) => {
          editor.on(event, this._eventHandlers[event]);
        });
        if (typeof baseConfig.setup === 'function') {
          baseConfig.setup(editor);
        }
      }
    };
    // use target
    this._getTinyMCE().init(conf);
  }

  attributeChangedCallback (attribute: string, oldValue: any, newValue: any) {
    if (oldValue !== newValue) {
      if (attribute === 'form') {
        this._updateForm();
      } else if (attribute === 'readonly') {
        this.readonly = newValue !== null;
      } else if (attribute === 'autofocus') {
        this.autofocus = newValue !== null;
      } else if (attribute === 'placeholder') {
        this.placeholder = newValue;
      } else if (attribute.toLowerCase().startsWith('on')) {
        this._updateEventAttr(attribute, newValue);
      }
    }
  };

  connectedCallback () {
    this._eventHandlers = this._getEventHandlers();
    this._mutationObserver.observe(this, { attributes: true, childList: false, subtree: false });
    this._updateForm();
    if (this.getAttribute('init') !== 'false') {
      this._doInit();
    }
  }

  disconnectedCallback () {
    this._mutationObserver.disconnect();
    this._updateForm();
  }

  get value () {
    return this._status === Status.Ready ? this._editor.getContent() : undefined;
  };

  set value (newValue: string) {
    if (this._status === Status.Ready) {
      this._editor.setContent(newValue);
    }
  }

  get readonly () {
    if (this._editor) {
      return this._editor.mode.get() === 'readonly';
    } else {
      return this.hasAttribute('readonly');
    }
  }

  set readonly (value: boolean) {
    if (value) {
      if (this._editor && this._editor.mode.get() !== 'readonly') {
        this._editor.mode.set('readonly');
      }
      if (!this.hasAttribute('readonly')) {
        this.setAttribute('readonly', '');
      }
    } else {
      if (this._editor && this._editor.mode.get() === 'readonly') {
        this._editor.mode.set('design');
      }
      if (this.hasAttribute('readonly')) {
        this.removeAttribute('readonly');
      }
    }
  }

  get placeholder () {
    return this.getAttribute('placeholder');
  }

  set placeholder (value: string | null) {
    if (this._editor) {
      const target: HTMLTextAreaElement = this._editor.getElement();
      if (target !== null) {
        if (value !== null) {
          target.setAttribute('placeholder', value);
        } else {
          target.removeAttribute('placeholder');
        }
      }
    }
    if (value !== null) {
      if (this.getAttribute('placeholder') !== value) {
        this.setAttribute('placeholder', value);
      }
    } else {
      if (this.hasAttribute('placeholder')) {
        this.removeAttribute('placeholder');
      }
    }
  }

  get autofocus () {
    return this.hasAttribute('autofocus');
  }

  set autofocus (value: boolean) {
    if (value) {
      if (!this.hasAttribute('autofocus')) {
        this.setAttribute('autofocus', '');
      }
    } else {
      if (this.hasAttribute('autofocus')) {
        this.removeAttribute('autofocus');
      }
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