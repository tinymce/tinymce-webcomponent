import { Resolve, Obj, Fun, Global } from '@ephox/katamari';
import { TinyMCE, Editor } from 'tinymce';
import { ScriptLoader } from '../utils/ScriptLoader';
type EditorOptions = Parameters<TinyMCE['init']>[0];
type EventHandler = Parameters<Editor['on']>[1];

// the advanced config will accept any attributes that start with `config-`
// and try to parse them as JSON or resolve them on the Global state.
const ADVANCED_CONFIG = false;

enum Status {
  Raw,
  Initializing,
  Ready
}

// handle traversing all shadow roots
const closestRecursive: {
  <K extends keyof HTMLElementTagNameMap>(selector: K, element: Element): HTMLElementTagNameMap[K] | null;
  <K extends keyof SVGElementTagNameMap>(selector: K, element: Element): SVGElementTagNameMap[K] | null;
  <E extends Element = Element>(selectors: string, element: Element): E | null;
} = (selector: string, element: Element): Element | null => {
  const found = element.closest(selector);
  if (found !== null) {
    return found;
  }
  const next = (element.getRootNode() as ShadowRoot).host;
  if (next !== null && next !== undefined) {
    return closestRecursive(selector, next);
  }
  return null;
};

const parseJsonResolveGlobals = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch (_e) { /* ignore */ }
  return Resolve.resolve(value);
};
const isLookupKey = <T extends Record<string, any>, K extends keyof T>(values: T, key: string | K): key is K => Obj.has(values, key);
const lookup = <T extends Record<string, unknown>, K extends keyof T>(values: T) => (key: string | K) => isLookupKey(values, key) ? values[key] : key;

const parseGlobal = Resolve.resolve;
const parseString = Fun.identity;
const parseFalseOrString = lookup({ 'false': false as const });
const parseBooleanOrString = lookup({ 'true': true, 'false': false });
const parseNumberOrString = (value: string) => /^\d+$/.test(value) ? Number.parseInt(value, 10) : value;

const configAttributes: Record<string, (v: string) => unknown> = {
  setup: parseGlobal, // function
  statusbar: parseBooleanOrString, // boolean
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
  icons_url: parseString, // url to icon pack js
  promotion: parseBooleanOrString, // boolean
};

const configRenames: Record<string, string> = {};

// Function that checks if the disabled option is supported with the version used
const isDisabledOptionSupported = (tinymce: TinyMCE): boolean => {
  const major = parseFloat(tinymce.majorVersion);
  const minor = parseFloat(tinymce.minorVersion);
  const version = major + minor / 10;
  return version >= 7.6;
};

class TinyMceEditor extends HTMLElement {
  private _status: Status;
  private _shadowDom: ShadowRoot;
  private _editor: Editor | undefined;
  private _form: HTMLFormElement | null;
  private _eventHandlers: Record<string, EventHandler | undefined>;
  private _mutationObserver: MutationObserver;

  static get formAssociated() {
    return true;
  }

  static get observedAttributes() {
    const nativeEvents = [ 'on-BeforePaste', 'on-Blur', 'on-Click', 'on-ContextMenu',
      'on-Copy', 'on-Cut', 'on-Dblclick', 'on-Drag', 'on-DragDrop', 'on-DragEnd',
      'on-DragGesture', 'on-DragOver', 'on-Drop', 'on-Focus', 'on-FocusIn',
      'on-FocusOut', 'on-KeyDown', 'on-KeyPress', 'on-KeyUp', 'on-MouseDown',
      'on-MouseEnter', 'on-MouseLeave', 'on-MouseMove', 'on-MouseOut', 'on-MouseOver',
      'on-MouseUp', 'on-Paste', 'on-SelectionChange' ];
    const tinyEvents = [ 'on-Activate', 'on-AddUndo', 'on-BeforeAddUndo',
      'on-BeforeExecCommand', 'on-BeforeGetContent', 'on-BeforeRenderUI',
      'on-BeforeSetContent', 'on-Change', 'on-ClearUndos', 'on-Deactivate',
      'on-Dirty', 'on-ExecCommand', 'on-GetContent', 'on-Hide', 'on-Init',
      'on-LoadContent', 'on-NodeChange', 'on-PostProcess', 'on-PostRender',
      'on-PreProcess', 'on-ProgressState', 'on-Redo', 'on-Remove', 'on-Reset',
      'on-SaveContent', 'on-SetAttrib', 'on-ObjectResizeStart', 'on-ObjectResized',
      'on-ObjectSelected', 'on-SetContent', 'on-Show', 'on-Submit', 'on-Undo',
      'on-VisualAid' ];

    return [ 'form', 'readonly', 'autofocus', 'placeholder', 'disabled' ].concat(nativeEvents).concat(tinyEvents);
  }

  constructor() {
    super();
    this._status = Status.Raw;
    this._shadowDom = this.attachShadow({ mode: 'open' });
    this._form = null;
    this._eventHandlers = {};
    this._mutationObserver = new MutationObserver(this._eventAttrHandler);
  }

  private _eventAttrHandler: MutationCallback = (records) => {
    records.forEach((record) => {
      if (record.type === 'attributes' && record.target === this && record.attributeName?.toLowerCase().startsWith('on-')) {
        this._updateEventAttr(record.attributeName, this.getAttribute(record.attributeName));
      }
    });
  };

  private _formDataHandler = (evt: FormDataEvent): void => {
    const name = this.name;
    if (name != null) {
      const value = this.value;
      if (value != null) {
        const data = evt.formData;
        data.append(name, value);
      }
    }
  };

  private _updateEventAttr(attrKey: string, attrValue: string | null): void {
    const event = attrKey.substring('on-'.length).toLowerCase();
    const resolved = attrValue !== null ? Resolve.resolve(attrValue) : undefined;
    const handler = typeof resolved === 'function' ? resolved as EventHandler : undefined;
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

  private _updateForm(): void {
    if (this.isConnected) {
      const formId = this.getAttribute('form');
      const form = formId !== null ? this.ownerDocument.querySelector<HTMLFormElement>('form#' + formId) : closestRecursive('form', this);
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

  private _getTinymce(): TinyMCE {
    return Global.tinymce;
  }

  private _getConfig(): EditorOptions {
    const config: EditorOptions = parseGlobal(this.getAttribute('config') ?? '') ?? {};
    for (let i = 0; i < this.attributes.length; i++) {
      const attr = this.attributes.item(i);
      if (attr !== null) {
        if (ADVANCED_CONFIG && attr.name.startsWith('config-')) {
          // add to config
          const prop = attr.name.substring('config-'.length);
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
    if (this.disabled) {
      config.disabled = true;
    }
    if (this.autofocus) {
      config.auto_focus = true;
    }
    delete config.target;
    delete config.selector;
    return config;
  }

  private _getEventHandlers(): Record<string, EventHandler> {
    const handlers: Record<string, EventHandler> = {};
    for (let i = 0; i < this.attributes.length; i++) {
      const attr = this.attributes.item(i);
      if (attr !== null) {
        if (attr.name.toLowerCase().startsWith('on-')) {
          const event = attr.name.toLowerCase().substring('on-'.length);
          const handler = Resolve.resolve(attr.value);
          if (typeof handler === 'function') {
            handlers[event] = handler as EventHandler;
          }
        }
      }
    }
    return handlers;
  }

  private _doInit(): void {
    this._status = Status.Initializing;
    // load
    const target = document.createElement('textarea');
    target.value = this.textContent ?? '';
    const attrId = this.attributes.getNamedItem('id')?.value;
    if (attrId) {
      target.id = attrId;
    }
    if (this.placeholder !== null) {
      target.placeholder = this.placeholder;
    }
    this._shadowDom.appendChild(target);
    const baseConfig = this._getConfig();
    const conf: EditorOptions = {
      ...baseConfig,
      target,
      setup: (editor: Editor) => {
        this._editor = editor;
        editor.on("init", (_e: unknown) => {
          const tinymce = this._getTinymce();
          const isDisableSupported = isDisabledOptionSupported(tinymce);
          if (isDisableSupported) {
            if (this.hasAttribute('readonly')) {
              this.setAttribute('readonly', '');
            } else {
              this.removeAttribute('readonly');
            }
          } else {
            if (!this.hasAttribute('disabled')) {
              this.setAttribute('disabled', '');
            } else {
              this.removeAttribute('disabled');
            }
          }
          this._status = Status.Ready;
        });
        editor.on('SwitchMode', (_e: unknown) => {
          // this assignment ensures the attribute is in sync with the editor
          this.readonly = this.readonly;
        });
        Obj.each(this._eventHandlers, (handler, event) => {
          if (handler !== undefined) {
            editor.on(event, handler);
          }
        });
        if (typeof baseConfig.setup === 'function') {
          baseConfig.setup(editor);
        }
      }
    };
    // use target
    this._getTinymce().init(conf);
  }

  private _getTinymceSrc(): string {
    const src = this.getAttribute('src');
    if (src) {
      return src;
    }
    const channel = this.getAttribute('channel') ?? '6';
    const apiKey = this.hasAttribute('api-key') ? this.getAttribute('api-key') : 'no-api-key';
    return `https://cdn.tiny.cloud/1/${apiKey}/tinymce/${channel}/tinymce.min.js`;

  }

  private _loadTinyDoInit(): void {
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

  attributeChangedCallback(attribute: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue) {
      if (attribute === 'form') {
        this._updateForm();
      } else if (attribute === 'disabled') {
        this.disabled = newValue !== null;
      } else if (attribute === 'readonly') {
        this.readonly = newValue !== null;
      } else if (attribute === 'autofocus') {
        this.autofocus = newValue !== null;
      } else if (attribute === 'placeholder') {
        this.placeholder = newValue;
      } else if (attribute.toLowerCase().startsWith('on-')) {
        this._updateEventAttr(attribute, newValue);
      }
    }
  }

  connectedCallback(): void {
    this._eventHandlers = this._getEventHandlers();
    this._mutationObserver.observe(this, { attributes: true, childList: false, subtree: false });
    this._updateForm();
    if (this._status === Status.Raw) {
      this._loadTinyDoInit();
    }
  }

  disconnectedCallback(): void {
    this._mutationObserver.disconnect();
    this._updateForm();
  }

  get value(): string | null {
    return (this._status === Status.Ready ? this._editor?.getContent() : undefined) ?? null;
  }

  set value(newValue: string | null) {
    if (this._status === Status.Ready && newValue != null) {
      this._editor?.setContent(newValue);
    }
  }

  get readonly(): boolean {
    if (this._editor) {
      return this._editor.mode.get() === "readonly";
    } else {
      return this.hasAttribute("readonly");
    }
  }

  set readonly(value: boolean) {
    if (value) {
      if (this._editor && this._editor.mode.get() !== "readonly") {
        this._editor.mode.set("readonly");
      }
      if (!this.hasAttribute("readonly")) {
        this.setAttribute("readonly", "");
      }
    } else {
      if (this._editor && this._editor.mode.get() === "readonly") {
        this._editor.mode.set("design");
      }
      if (this.hasAttribute("readonly")) {
        this.removeAttribute("readonly");
      }
    }
  }

  get disabled(): boolean {
    return this._editor
      ? this._editor.options.get("disabled")
      : this.hasAttribute("disabled");
  }

  set disabled(value: boolean) {
    const tinymce = this._getTinymce?.();
    const isNew = tinymce ? isDisabledOptionSupported(tinymce) : true;
  
    if (this._editor && this._status === Status.Ready) {
      if (isNew) {
        this._editor.options.set('disabled', value); 
      } else {
        this._editor.mode.set(value ? 'readonly' : 'design');
      }
    }
  
    if (value && !this.hasAttribute('disabled')) {
      this.setAttribute('disabled', '');
    } else if (!value && this.hasAttribute('disabled')) {
      this.removeAttribute('disabled');
    }
  }

  get placeholder(): string | null {
    return this.getAttribute('placeholder');
  }

  set placeholder(value: string | null) {
    if (this._editor) {
      const target = this._editor.getElement();
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

  get autofocus(): boolean {
    return this.hasAttribute('autofocus');
  }

  set autofocus(value: boolean) {
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

  get form(): HTMLFormElement | null {
    return this._form;
  }
  get name(): string | null {
    return this.getAttribute('name');
  }
  get type(): string {
    return this.localName;
  }
}

// export default TinyMceEditor;
export default () => {
  window.customElements.define('tinymce-editor', TinyMceEditor);
};

