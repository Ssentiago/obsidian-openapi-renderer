import { completionKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, indentWithTab, redo, undo } from '@codemirror/commands';
import { KeyBinding } from '@codemirror/view';
import { OpenAPISource } from 'ui/views/OpenAPI/components/source/openapi-source';

function createBoundKeymap(editor: OpenAPISource): KeyBinding[] {
    return [
        ...defaultKeymap,
        completionKeymap,
        indentWithTab,
        {
            key: 'Mod-z',
            run: (target): boolean => undo(target),
        },
        {
            key: 'Mod-Shift-z',
            run: (target): boolean => redo(target),
        },
    ] as KeyBinding[];
}

export default createBoundKeymap;
