import { Assertions } from '@ephox/agar';
import { before, describe, it, context, after, afterEach } from '@ephox/bedrock-client';
import { Global } from '@ephox/katamari';
import type { Editor, TinyMCE, Editor as TinyMCEEditor } from 'tinymce';
import { VersionLoader, TinyVer } from '@tinymce/miniature';
import { createTinymceElement, deleteTinymce, registerCustomElementIfNot, removeTinymceElement } from '../alien/Utils';
import { Attribute, SugarElement } from '@ephox/sugar';

type EditorElement = HTMLElement & { disabled?: boolean };
declare const tinymce: TinyMCE;

describe('DisableTest', () => {
  let uid = 0;
  const nextId = () => `_disabled_test_fn_${uid++}`;

  before(() => {
    registerCustomElementIfNot();
    Global.tinymceTestConfig = { license_key: 'gpl' };
  });

  after(() => {
    delete Global.tinymceTestConfig;
  });

  const pCreateEditor =
    (attrs: Record<string, string> = {}): Promise<{ element: SugarElement<EditorElement>; editor: TinyMCEEditor }> => new Promise((resolve) => {
      const setupFnName = nextId();
      const initFnName = nextId();
      // eslint-disable-next-line prefer-const
      let tinymceEl: SugarElement<EditorElement>;
      let editorInstance: any;

      Global[setupFnName] = (editor: Editor) => {
        editor.on('SkinLoaded', () => {
          if (editor.licenseKeyManager) {
            editor.licenseKeyManager.validate({}).then(() => {
              resolve({ element: tinymceEl, editor: editorInstance });
            }).catch(() => {
              resolve({ element: tinymceEl, editor: editorInstance });
            });
          } else {
            resolve({ element: tinymceEl, editor: editorInstance });
          }
        });
        editorInstance = editor;
      };

      tinymceEl = createTinymceElement({
        'setup': setupFnName,
        'on-init': initFnName,
        'config': 'tinymceTestConfig',
        ...attrs
      });
    });

  context('When using with Tinymce < 7.6', () => {
    before(async () => {
      await VersionLoader.pLoadVersion('7.5.0');
      Assertions.assertEq('Tinymce 7.5.0 should be loaded',
        '7.5.0',
        TinyVer.getVersion(tinymce).major + '.' + TinyVer.getVersion(tinymce).minor + '.' + TinyVer.getVersion(tinymce).patch);
    });

    after(() => {
      deleteTinymce();
    });

    it('Editor should be not be disabled when disabled attribute is present', async () => {
      const { editor } = await pCreateEditor();
      Assertions.assertEq('Editor should be in design mode', true, editor.mode.get() === 'design');
      removeTinymceElement();
    });
  });

  context('When using with Tinymce >= 7.6', () => {
    before(async () => {
      await VersionLoader.pLoadVersion('8');
      Assertions.assertEq('Tinymce 8 should be loaded', '8', TinyVer.getVersion(tinymce).major + '');
    });

    afterEach(() => {
      removeTinymceElement();
    });

    after(() => {
      deleteTinymce();
    });

    const pWaitForDisabledStateChange = (editor: any): Promise<void> =>
      new Promise((resolve) => editor.once('DisabledStateChange', resolve));

    const assertDisabledState = (el: SugarElement<EditorElement>, editor: TinyMCEEditor, expected: boolean) => {
      const hasDisabledAtt = Attribute.has(el, 'disabled');
      Assertions.assertEq('Editor should be disabled', expected, editor.options.get('disabled'));
      Assertions.assertEq(`disabled attribute should be ${expected ? 'present' : 'absent'}`, expected, hasDisabledAtt);
    };

    it('Editor should be disabled when disabled attribute is present', async () => {
      const { element, editor } = await pCreateEditor({ disabled: '' });
      assertDisabledState(element, editor, true);
    });

    it('Editor is not disabled when disabled attribute is absent', async () => {
      const { element, editor } = await pCreateEditor();
      assertDisabledState(element, editor, false);
    });

    it('Setting disabled attribute after init disables the editor', async () => {
      const { element, editor } = await pCreateEditor();
      assertDisabledState(element, editor, false);
      Attribute.set(element, 'disabled', '');
      await pWaitForDisabledStateChange(editor);
      assertDisabledState(element, editor, true);
    });

    it('Removing disabled attribute after init enables the editor', async () => {
      const { element, editor } = await pCreateEditor({ disabled: '' });
      assertDisabledState(element, editor, true);
      Attribute.remove(element, 'disabled');
      await pWaitForDisabledStateChange(editor);
      assertDisabledState(element, editor, false);
    });

    it('Updating disabled property directly syncs editor option and attribute', async () => {
      const { element, editor } = await pCreateEditor();
      Assertions.assertEq('disabled property should be false initially', false, element.dom.disabled);
      element.dom.disabled = true;
      await pWaitForDisabledStateChange(editor);
      assertDisabledState(element, editor, true);
      element.dom.disabled = false;
      await pWaitForDisabledStateChange(editor);
      assertDisabledState(element, editor, false);
    });
  });
});
