import { defaultKeymap, indentWithTab, redo, undo } from '@codemirror/commands';
import { SwaggerEditor } from './OpenAPIEditorView';
import { KeyBinding } from '@codemirror/view';
import { openAPIFormatter } from './formatter';

function createBoundKeymap(editor: SwaggerEditor): KeyBinding[] {
    return [
        ...defaultKeymap,
        indentWithTab,
        {
            key: 'Mod-z',
            run: (target): boolean => undo(target),
        },
        { key: 'Mod-Shift-z', run: (target): boolean => redo(target) },
        {
            key: 'Mod-Alt-l',
            run: (target): boolean => openAPIFormatter(editor, target),
        },
    ] as KeyBinding[];
}

export default createBoundKeymap;
