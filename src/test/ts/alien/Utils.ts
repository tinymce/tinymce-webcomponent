import { Attribute, Remove, SelectorFilter, SugarElement } from '@ephox/sugar';
import { ScriptLoader } from 'src/main/ts/utils/ScriptLoader';
import { Arr, Global, Strings } from '@ephox/katamari';

export const deleteTinymce = () => {
  ScriptLoader.reinitialize();

  delete Global.tinymce;
  delete Global.tinyMCE;

  const hasTinyUri = (attrName: string) => (elm: SugarElement<Element>) =>
    Attribute.getOpt(elm, attrName).exists((src) => Strings.contains(src, 'tinymce'));

  const elements = Arr.flatten([
    Arr.filter(SelectorFilter.all('script'), hasTinyUri('src')),
    Arr.filter(SelectorFilter.all('link'), hasTinyUri('href')),
  ]);

  Arr.each(elements, Remove.remove);
};