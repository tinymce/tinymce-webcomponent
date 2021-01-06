import { Pipeline, Step, Waiter, Assertions } from '@ephox/agar';
import { SugarElement, Attribute, SugarBody, Insert, Remove, SelectorFilter, TextContent } from '@ephox/sugar';
import { UnitTest } from '@ephox/bedrock-client';
import Editor from '../../../main/ts/component/Editor';
import { Arr, Global } from '@ephox/katamari';

const makeTinymceElement = (attrs: Record<string, string>, content: string) => {
  const ce = SugarElement.fromTag('tinymce-editor');
  Attribute.setAll(ce, attrs);
  TextContent.set(ce, content);
  Insert.append(SugarBody.body(), ce);
};

const removeTinymceElement = () => {
  Arr.map(SelectorFilter.all('tinymce-editor'), Remove.remove);
};

UnitTest.asynctest('LoadTest', (success, failure) => {
  Editor();
  let seenSetup = false;
  let seenInit = false;
  let editorInstance: any;
  Pipeline.async('', [
    Step.sync(() => {
      Global.customElementTinymceSetup = (editor: any) => {
        seenSetup = true;
        editorInstance = editor;
      };
      Global.customElementTinymceInit = (_evt: unknown) => {
        seenInit = true;
      };
    }),
    Step.sync(() => makeTinymceElement({ setup: 'customElementTinymceSetup', 'on-init': 'customElementTinymceInit' }, '<p>Hello world</p>')),
    Waiter.sTryUntilPredicate('Waiting for editor setup', () => seenSetup),
    Waiter.sTryUntilPredicate('Waiting for editor init', () => seenInit),
    Step.sync(() => {
      Assertions.assertHtmlStructure('', '<p>Hello world</p>', editorInstance.getContent());
    }),
    Step.sync(() => removeTinymceElement())
  ], success, failure);
});