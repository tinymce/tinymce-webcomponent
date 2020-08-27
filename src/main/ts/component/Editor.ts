import { Resolve, Obj, Fun, Global } from '@ephox/katamari';
import { ScriptLoader } from '../utils/ScriptLoader';

// the advanced config will accept any attributes that start with `config-`
// and try to parse them as JSON or resolve them on the Global state.
const ADVANCED_CONFIG = false;

enum Status {
  Raw,
  Initializing,
  Ready
}

const parseJsonResolveGlobals = (value: string): any => {
  try {
    return JSON.parse(value);
  } catch(e) { /* ignore */ }
  return Resolve.resolve(value);
};
const lookup = (values: Record<string, any>) => (key: string) => Obj.has(values, key) ? values[key] : key;

const parseGlobal = Resolve.resolve;
const parseString = Fun.identity;
const parseFalseOrString = lookup({ 'false': false });
const parseBooleanOrString = lookup({ 'true': true, 'false': false });
const parseNumberOrString = (value: string) => /^\d+$/.test(value) ? Number.parseInt(value, 10) : value


const configAttributes: Record<string, (v: string) => unknown> = {
  setup: parseGlobal, // function
  toolbar: parseFalseOrString, // string or false
  menubar: parseFalseOrString, // string or false
  plugins: parseString, // string
  content_css: parseString, // 'default', 'dark', 'document', 'writer', or a path to a css file
  content_style: parseString, // string
  width: parseNumberOrString, // integer or string
  height: parseNumberOrString, // integer or string
  toolbar_mode: parseString, // 'floating', 'sliding', 'scrolling', or 'wrap'
  contextmenu: parseFalseOrString, // string or false
  quickbars_insert_toolbar: parseFalseOrString, // string or false
  quickbars_selection_toolbar: parseFalseOrString, // string or false
  powerpaste_word_import: parseString, // 'clean', 'merge', or 'prompt'
  powerpaste_html_import: parseString, // 'clean', 'merge', or 'prompt'
  powerpaste_allow_local_images: parseBooleanOrString, // boolean
  resize: parseBooleanOrString, // boolean or 'both'
  skin: parseString, // string
  skin_url: parseString, // string
  images_upload_url: parseString, // string
  images_upload_handler: parseGlobal, // function
  images_upload_base_path: parseString, // string
  images_upload_credentials: parseBooleanOrString, // boolean
  images_reuse_filename: parseBooleanOrString, // boolean
  icons: parseString, // name of icon pack eg. 'material'
  icons_url: parseString // url to icon pack js
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
    const nativeEvents = ['on-BeforePaste', 'on-Blur', 'on-Click', 'on-ContextMenu',
     'on-Copy', 'on-Cut', 'on-Dblclick', 'on-Drag', 'on-DragDrop', 'on-DragEnd',
     'on-DragGesture', 'on-DragOver', 'on-Drop', 'on-Focus', 'on-FocusIn',
     'on-FocusOut', 'on-KeyDown', 'on-KeyPress', 'on-KeyUp', 'on-MouseDown',
     'on-MouseEnter', 'on-MouseLeave', 'on-MouseMove', 'on-MouseOut', 'on-MouseOver',
     'on-MouseUp', 'on-Paste', 'on-SelectionChange'];
    const tinyEvents = ['on-Activate', 'on-AddUndo', 'on-BeforeAddUndo',
     'on-BeforeExecCommand', 'on-BeforeGetContent', 'on-BeforeRenderUI',
     'on-BeforeSetContent', 'on-Change', 'on-ClearUndos', 'on-Deactivate',
     'on-Dirty', 'on-ExecCommand', 'on-GetContent', 'on-Hide', 'on-Init',
     'on-LoadContent', 'on-NodeChange', 'on-PostProcess', 'on-PostRender',
     'on-PreProcess', 'on-ProgressState', 'on-Redo', 'on-Remove', 'on-Reset',
     'on-SaveContent', 'on-SetAttrib', 'on-ObjectResizeStart', 'on-ObjectResized',
     'on-ObjectSelected', 'on-SetContent', 'on-Show', 'on-Submit', 'on-Undo',
     'on-VisualAid'];

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
      if (record.type === 'attributes' && record.target === this && record.attributeName?.toLowerCase().startsWith('on-')) {
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
    const event = attrKey.substring('on-'.length).toLowerCase();
    const handler = attrValue !== null ? Resolve.resolve(attrValue) : undefined;
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

  private _getTinymce () {
    return Global.tinymce;
  };

  private _getConfig() {
    const config: Record<string, unknown> = parseGlobal(this.getAttribute('config') ?? '') ?? {};
    for (let i = 0; i < this.attributes.length; i++) {
      const attr = this.attributes.item(i);
      if (attr !== null) {
        if (ADVANCED_CONFIG && attr.name.startsWith('config-')) {
          // add to config
          const prop = attr.name.substr('config-'.length);
          config[prop] = parseJsonResolveGlobals(attr.value);
        } else if (Obj.has(configAttributes, attr.name)) {
          const prop = Obj.has(configRenames, attr.name) ? configRenames[attr.name] : attr.name;
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
    delete config['target'];
    delete config['selector'];
    return config;
  }

  private _getEventHandlers() {
    const handlers: Record<string, any> = {};
    for (let i = 0; i < this.attributes.length; i++) {
      const attr = this.attributes.item(i);
      if (attr !== null) {
        if (attr.name.toLowerCase().startsWith('on-')) {
          const event = attr.name.toLowerCase().substr('on-'.length);
          const handler = Resolve.resolve(attr.value);
          handlers[event] = handler;
        }
      }
    }
    return handlers;
  }

  private _doInit() {
    this._status = Status.Initializing;
    // load
    const target = document.createElement('textarea');
    target.value = this.textContent ?? "";
    if (this.placeholder !== null) {
      target.placeholder = this.placeholder;
    }
    this._shadowDom.appendChild(target);
    const baseConfig = this._getConfig();
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
    this._getTinymce().init(conf);
  }

  private _getTinymceSrc() {
    const src = this.getAttribute('src');
    if (src) {
      return src;
    }
    const channel = this.getAttribute('channel') ?? '5-stable';
    const apiKey = this.hasAttribute('api-key') ? this.getAttribute('api-key') : 'no-api-key';
    return `https://cdn.tiny.cloud/1/${apiKey}/tinymce/${channel}/tinymce.min.js`;
    
  }

  private _loadTinyDoInit() {
    if (this._getTinymce()) {
      this._doInit();
    } else {
      ScriptLoader.load(
        this.ownerDocument,
        this._getTinymceSrc(),
        () => this._doInit()
      );
    }
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
    if (this._status === Status.Raw) {
      this._loadTinyDoInit();
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
}

// export default TinyMceEditor;
export default function() {
  customElements.define('tinymce-editor', TinyMceEditor);
}