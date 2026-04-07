import { Attribute, Remove, SelectorFilter, SugarElement } from '@ephox/sugar';
import { ScriptLoader } from 'src/main/ts/utils/ScriptLoader';
import { Arr, Strings, Optional, Fun } from '@ephox/katamari';
// eslint-disable-next-line @tinymce/no-direct-imports
import * as Globals from '@tinymce/miniature/lib/main/ts/loader/Globals';
import Editor from 'src/main/ts/component/Editor';

export const deleteTinymce = () => {
  ScriptLoader.reinitialize();
  Globals.deleteTinymceGlobals();

  const hasTinyUri = (attrName: string) => (elm: SugarElement<Element>) =>
    Attribute.getOpt(elm, attrName).exists((src) => Strings.contains(src, 'tinymce'));

  const elements = Arr.flatten([
    Arr.filter(SelectorFilter.all('script'), hasTinyUri('src')),
    Arr.filter(SelectorFilter.all('link'), hasTinyUri('href')),
  ]);

  Arr.each(elements, Remove.remove);
};

export const removeTinymceElement = () => {
  Arr.map(SelectorFilter.all('tinymce-editor'), Remove.remove);
};

export const registerCustomElementIfNot = () => {
  Optional.from(window.customElements?.get('tinymce-editor')).fold(Editor, Fun.noop);
};

export const createTinymceElement = (attrs: Record<string, string>, content?: string) => {
  const ce = SugarElement.fromTag('tinymce-editor');
  Attribute.setAll(ce, attrs);
  if (content) {
    ce.dom.innerHTML = content;
  }
  document.body.appendChild(ce.dom);
  return ce;
};