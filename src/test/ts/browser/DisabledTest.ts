import { Assertions } from '@ephox/agar';
import { before, describe, it, context, after, afterEach } from '@ephox/bedrock-client';
import { Global } from '@ephox/katamari';
import type { TinyMCE, Editor as TinyMCEEditor } from 'tinymce';
import { VersionLoader, TinyVer } from '@tinymce/miniature';
import { deleteTinymce, registerCustomElementIfNot, removeTinymceElement } from '../alien/Utils';

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
    (attrs: Record<string, string> = {}): Promise<{ el: EditorElement; editor: TinyMCEEditor }> => new Promise((resolve) => {
      const setupFnName = nextId();
      const initFnName = nextId();
      let editorInstance: any;

      Global[setupFnName] = (editor: any) => {
        editorInstance = editor;
      };

      Global[initFnName] = () => {
        resolve({ el: el as EditorElement, editor: editorInstance });
      };

      const el = document.createElement('tinymce-editor');
      el.setAttribute('config', 'tinymceTestConfig');
      el.setAttribute('setup', setupFnName);
      el.setAttribute('on-init', initFnName);
      for (const [ key, value ] of Object.entries(attrs)) {
        el.setAttribute(key, value);
      }

      document.body.appendChild(el);
    });

  context('When using with Tinymce < 7.6', () => {
    before(async () => {
      await VersionLoader.pLoadVersion('7.5.0');
      Assertions.assertEq('Tinymce 7.5.0 should be loaded', '7.5.0', TinyVer.getVersion(tinymce).major + '.' + TinyVer.getVersion(tinymce).minor + '.' + TinyVer.getVersion(tinymce).patch);
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

    const assertDisabledState = (el: EditorElement, editor: TinyMCEEditor, expected: boolean) => {
      const hasDisabledAtt = el.hasAttribute('disabled');
      Assertions.assertEq('Editor should be disabled', expected, editor.options.get('disabled'));
      Assertions.assertEq(`disabled attribute should be ${expected ? 'present' : 'absent'}`, expected, hasDisabledAtt);
    };

    it('Editor should be disabled when disabled attribute is present', async () => {
      const { el, editor } = await pCreateEditor({ disabled: '' });
      assertDisabledState(el, editor, true);
    });

    it('Editor is not disabled when disabled attribute is absent', async () => {
      const { el, editor } = await pCreateEditor();
      assertDisabledState(el, editor, false);
    });

    it('Setting disabled attribute after init disables the editor', async () => {
      const { el, editor } = await pCreateEditor();
      assertDisabledState(el, editor, false);
      el.setAttribute('disabled', '');
      await pWaitForDisabledStateChange(editor);
      assertDisabledState(el, editor, true);
    });

    it('Removing disabled attribute after init enables the editor', async () => {
      const { el, editor } = await pCreateEditor({ disabled: '' });
      assertDisabledState(el, editor, true);
      el.removeAttribute('disabled');
      await pWaitForDisabledStateChange(editor);
      assertDisabledState(el, editor, false);
    });

    it('Updating disabled property directly syncs editor option and attribute', async () => {
      const { el, editor } = await pCreateEditor();
      Assertions.assertEq('disabled property should be false initially', false, el.disabled);
      el.disabled = true;
      await pWaitForDisabledStateChange(editor);
      assertDisabledState(el, editor, true);
      el.disabled = false;
      await pWaitForDisabledStateChange(editor);
      assertDisabledState(el, editor, false);
    });
  });
});
