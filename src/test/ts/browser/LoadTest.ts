import { Assertions } from '@ephox/agar';
import { before, describe, after, it } from '@ephox/bedrock-client';
import { Global } from '@ephox/katamari';
import { createTinymceElement, deleteTinymce, registerCustomElementIfNot, removeTinymceElement } from '../alien/Utils';
import { VersionLoader } from '@tinymce/miniature';
import { Editor } from 'tinymce';

describe('LoadTest', () => {
  before(async () => {
    await VersionLoader.pLoadVersion('8');
    registerCustomElementIfNot();
    Global.tinymceTestConfig = { license_key: 'gpl' };
  });

  after(() => {
    delete Global.tinymceTestConfig;
    deleteTinymce();
  });

  it('Should load the editor and execute setup and init callbacks', async () => {
    let seenSetup = false;
    let seenInit = false;
    let editorInstance: Editor | undefined;

    await new Promise((resolve) => {
      Global.customElementTinymceSetup = (editor: Editor) => {
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

    Assertions.assertEq('Editor setup callback should be called', true, seenSetup);
    Assertions.assertEq('Editor init callback should be called', true, seenInit);
    Assertions.assertEq('An editor instance is registered', true, Global.tinymce.get('example_id') !== null);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    Assertions.assertHtmlStructure('The editor has the correct content', '<p>Hello world</p>', editorInstance!.getContent() as string);

    removeTinymceElement();
  });
});