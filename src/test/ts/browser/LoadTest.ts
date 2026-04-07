import { Assertions } from '@ephox/agar';
import { before, describe, after, it } from '@ephox/bedrock-client';
import { Global } from '@ephox/katamari';
import { createTinymceElement, deleteTinymce, registerCustomElementIfNot, removeTinymceElement } from '../alien/Utils';
import { VersionLoader } from '@tinymce/miniature';

describe('LoadTest', () => {
  let seenSetup = false;
  let seenInit = false;
  let editorInstance: any;

  before(async () => {
    await VersionLoader.pLoadVersion('8');
    registerCustomElementIfNot();
    Global.tinymceTestConfig = { license_key: 'gpl' };

    await new Promise((resolve) => {
      Global.customElementTinymceSetup = (editor: any) => {
        seenSetup = true;
        editorInstance = editor;
      };
      Global.customElementTinymceInit = (_evt: unknown) => {
        seenInit = true;
        resolve({});
      };
      createTinymceElement({
        'setup': 'customElementTinymceSetup',
        'on-init': 'customElementTinymceInit',
        'config': 'tinymceTestConfig',
        'id': 'example_id'
      }, '<p>Hello world</p>');
    });
  });

  after(() => {
    delete Global.tinymceTestConfig;
    removeTinymceElement();
    Assertions.assertEq('The editor instance is removed', true, Global.tinymce.get('example_id') === null);
    deleteTinymce();
  });

  it('Should load the editor and execute setup and init callbacks', () => {
    Assertions.assertEq('Editor setup callback should be called', true, seenSetup);
    Assertions.assertEq('Editor init callback should be called', true, seenInit);
    Assertions.assertEq('An editor instance is registered', true, Global.tinymce.get('example_id') !== null);
    Assertions.assertHtmlStructure('', '<p>Hello world</p>', editorInstance.getContent() as string);
    Assertions.assertEq('An editor instance is registered', true, Global.tinymce.get('example_id') !== null);
  });
});