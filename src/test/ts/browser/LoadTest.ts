import { Assertions } from '@ephox/agar';
import { before, describe, after, it } from '@ephox/bedrock-client';
import { Global } from '@ephox/katamari';
import { createTinymceElement, deleteTinymce, registerCustomElementIfNot, removeTinymceElement } from '../alien/Utils';
import { Editor } from 'tinymce';
import { VersionLoader } from '@tinymce/miniature';

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

    const { editor } = await new Promise<{ editor: Editor }>((resolve) => {
      Global.customElementTinymceSetup = (ed: Editor) => {
        seenSetup = true;
        ed.on('SkinLoaded', () => {
          setTimeout(() => resolve({ editor: ed }), 500);
        });
      };
      Global.customElementTinymceInit = (_evt: unknown) => {
        seenInit = true;
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
    Assertions.assertHtmlStructure('The editor has the correct content', '<p>Hello world</p>', editor.getContent() as string);
    removeTinymceElement();
  });
});