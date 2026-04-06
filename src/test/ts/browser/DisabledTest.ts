import { Assertions } from '@ephox/agar';
import { before, describe, it, context, after, beforeEach, afterEach } from '@ephox/bedrock-client';
import { Global } from '@ephox/katamari';
import { VersionHooks  } from '@tinymce/miniature';
import { deleteTinymce } from '../alien/Utils';
import type { Editor as TinyMCEEditor } from 'tinymce';
import { Remove, SugarElement } from '@ephox/sugar';

type EditorElement = HTMLElement & { disabled: boolean };

describe('DisableTest', () => {
  let uid = 0;
  const nextId = () => `_disabled_test_fn_${uid++}`;

  before(() => {
    Global.tinymceTestConfig = { license_key: 'gpl' };
  });
  
  after(() => {   
    delete Global.tinymceTestConfig;
  });

  // const setupVersionContext = (version: string) => {
  //   before(async () => {
  //     // await VersionLoader.pLoadVersion(version);
  //     Global.tinymceTestConfig = { license_key: 'gpl' };
  //   });

  //   after(() => {
  //     delete Global.tinymceTestConfig;
  //     console.log('Deleting tinymce from global');
  //     deleteTinymce();
  //   });

  //   beforeEach(() => {
  //     // if (!window.customElements.get('tinymce-editor')) {
  //     //   Editor();
  //     // }
  //   });

  //   afterEach(() => {
  //     document.querySelectorAll('tinymce-editor').forEach((el) => el.remove());
  //   });
  // };

  // const editorHook = VersionHooks.bddSetupVersionFromElement('latest', {}, () => {
  //   const el = document.createElement('tinymce-editor') as EditorElement;
  //   el.setAttribute('config', 'tinymceTestConfig');
  //   document.body.appendChild(el);
  //   return {
  //     element: SugarElement.fromDom(el),
  //     teardown: () => {
  //       delete Global.tinymceTestConfig;
  //       deleteTinymce();
  //     }
  //   };
  // });

  const pCreateEditor =
    (attrs: Record<string, string> = {}): Promise<{ el: EditorElement; editor: TinyMCEEditor }> => new Promise((resolve) => {
      const setupFnName = nextId();
      const initFnName = nextId();
      let editorInstance: any;

      Global[setupFnName] = (editor: any) => {
        delete Global[setupFnName];
        editorInstance = editor;
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

  const createHoook = (version: string, attrs: Record<string, string>) =>
    VersionHooks.bddSetupVersionFromElement(version, {}, () => {
      const el = document.createElement('tinymce-editor');
      el.setAttribute('config', 'tinymceTestConfig');      
      for (const [ key, value ] of Object.entries(attrs)) {
        el.setAttribute(key, value);
      }
      document.body.appendChild(el);
      const sEl = SugarElement.fromDom(el);

      return {
        element: sEl,
        teardown: () => {
          Remove.remove(sEl);
        }
      }
  });

  context('When using with Tinymce < 7.6', () => {
    const hook = createHoook('7.5.0', { disabled: '' });

    after(() => {
      // Necessary to clean up the editor loading scripts otherwise bedrock will complain about extra elements were left in the DOM
      deleteTinymce();
    });

    it.only('Editor should be not be disabled when disabled attribute is present', () => {
      Assertions.assertEq('Editor should be in design mode', true, hook.editor().mode.get() === 'design');
    });
  });

  // context('When using with Tinymce >= 7.6', () => {

  //   const pWaitForDisabledStateChange = (editor: any): Promise<void> =>
  //     new Promise((resolve) => editor.once('DisabledStateChange', resolve));

  //   const assertDisabledState = (el: EditorElement, editor: TinyMCEEditor, expected: boolean) => {
  //     const hasDisabledAtt = el.hasAttribute('disabled');
  //     Assertions.assertEq('Editor should be disabled', expected, editor.options.get('disabled'));
  //     Assertions.assertEq(`disabled attribute should be ${expected ? 'present' : 'absent'}`, expected, hasDisabledAtt);
  //   };

  //   it('Editor should be disabled when disabled attribute is present', async () => {
  //     const { el, editor } = await pCreateEditor({ disabled: '' });
  //     assertDisabledState(el, editor, true);
  //   });

  //   it('Editor is not disabled when disabled attribute is absent', async () => {
  //     const { el, editor } = await pCreateEditor();
  //     assertDisabledState(el, editor, false);
  //   });

  //   it('Setting disabled attribute after init disables the editor', async () => {
  //     const { el, editor } = await pCreateEditor();
  //     assertDisabledState(el, editor, false);
  //     el.setAttribute('disabled', '');
  //     await pWaitForDisabledStateChange(editor);
  //     assertDisabledState(el, editor, true);
  //   });

  //   it('Removing disabled attribute after init enables the editor', async () => {
  //     const { el, editor } = await pCreateEditor({ disabled: '' });
  //     assertDisabledState(el, editor, true);
  //     el.removeAttribute('disabled');
  //     await pWaitForDisabledStateChange(editor);
  //     assertDisabledState(el, editor, false);
  //   });

  //   it('Updating disabled property directly syncs editor option and attribute', async () => {
  //     const { el, editor } = await pCreateEditor();
  //     Assertions.assertEq('disabled property should be false initially', false, el.disabled);
  //     el.disabled = true;
  //     await pWaitForDisabledStateChange(editor);
  //     assertDisabledState(el, editor, true);
  //     el.disabled = false;
  //     await pWaitForDisabledStateChange(editor);
  //     assertDisabledState(el, editor, false);
  //   });
  // });
});
