import { Assertions } from '@ephox/agar';
import { before, after, describe, it, context, afterEach } from '@ephox/bedrock-client';
import { Global } from '@ephox/katamari';
import Editor from '../../../main/ts/component/Editor';
import { VersionLoader } from "@tinymce/miniature";
import { deleteTinymce } from '../alien/Utils';

type EditorElement = HTMLElement & { disabled: boolean };

describe('DisableTest', () => {
  context('disabled option is not supported (<TinyMCE 7.6)', () => {
    
  });

  context('disbaled option is supported', () => {
    before(async () => {
      await VersionLoader.pLoadVersion('8');
      Global.tinymce.baseURL = '/node_modules/tinymce';
      Global.tinymceTestConfig = { license_key: 'gpl' };
      if (!window.customElements.get('tinymce-editor')) {
        Editor();
      } 
    });

    after(() => {
      document.querySelectorAll('tinymce-editor').forEach((el) => el.remove());
      deleteTinymce();
    });

    afterEach(() => {
      document.querySelectorAll('tinymce-editor').forEach((el) => el.remove());
    });

    let uid = 0;
    const nextId = () => `_disabled_test_fn_${uid++}`;

    const pCreateEditor = (
      attrs: Record<string, string> = {},
      onSetup?: (editor: any) => void
    ): Promise<{ el: EditorElement; editor: any }> =>
      new Promise((resolve) => {
        const setupFnName = nextId();
        const initFnName = nextId();
        let editorInstance: any;

        Global[setupFnName] = (editor: any) => {
          delete Global[setupFnName];
          editorInstance = editor;
          onSetup?.(editor);
        };

        Global[initFnName] = () => {
          delete Global[initFnName];
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

    const pWaitForDisabledChange = (editor: any): Promise<void> =>
      new Promise((resolve) => editor.once('DisabledStateChange', resolve));

    it('Editor initializes with disabled attribute — disabled option is true', async () => {
      const { el, editor } = await pCreateEditor({ disabled: '' });
      Assertions.assertEq('Editor option should be disabled on init', true, editor.options.get('disabled'));
      Assertions.assertEq('Element should have disabled attribute', true, el.hasAttribute('disabled'));
    });

    it('Editor initializes without disabled attribute — disabled option is false', async () => {
      const { el, editor } = await pCreateEditor();
      Assertions.assertEq('Editor option should not be disabled on init', false, editor.options.get('disabled'));
      Assertions.assertEq('Element should not have disabled attribute', false, el.hasAttribute('disabled'));
    });

    it('Setting disabled attribute after init disables the editor', async () => {
      const { el, editor } = await pCreateEditor();
      Assertions.assertEq('Editor should not be disabled initially', false, editor.options.get('disabled'));
      el.setAttribute('disabled', '');
      await pWaitForDisabledChange(editor);
      Assertions.assertEq('Editor option should be disabled after setAttribute', true, editor.options.get('disabled'));
      Assertions.assertEq('Element should have disabled attribute', true, el.hasAttribute('disabled'));
    });

    it('Removing disabled attribute after init enables the editor', async () => {
      const { el, editor } = await pCreateEditor({ disabled: '' });
      Assertions.assertEq('Editor should be disabled initially', true, editor.options.get('disabled'));
      el.removeAttribute('disabled');
      await pWaitForDisabledChange(editor);
      Assertions.assertEq('Editor option should not be disabled after removeAttribute', false, editor.options.get('disabled'));
      Assertions.assertEq('Element should not have disabled attribute', false, el.hasAttribute('disabled'));
    });

    it('Setting disabled property directly syncs editor option and attribute', async () => {
      const { el, editor } = await pCreateEditor();
      Assertions.assertEq('disabled property should be false initially', false, el.disabled);
      el.disabled = true;
      await pWaitForDisabledChange(editor);
      Assertions.assertEq('disabled property should be true', true, el.disabled);
      Assertions.assertEq('disabled attribute should be present', true, el.hasAttribute('disabled'));
      Assertions.assertEq('editor option should be true', true, editor.options.get('disabled'));
      el.disabled = false;
      await pWaitForDisabledChange(editor);
      Assertions.assertEq('disabled property should be false', false, el.disabled);
      Assertions.assertEq('disabled attribute should be absent', false, el.hasAttribute('disabled'));
      Assertions.assertEq('editor option should be false', false, editor.options.get('disabled'));
    });
  });
});
