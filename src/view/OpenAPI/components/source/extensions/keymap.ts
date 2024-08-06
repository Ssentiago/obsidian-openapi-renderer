import { defaultKeymap, redo, undo } from '@codemirror/commands';
import { OpenAPISource } from '../OpenAPI-source';
import { KeyBinding } from '@codemirror/view';
import { completionKeymap } from '@codemirror/autocomplete';

function createBoundKeymap(editor: OpenAPISource): KeyBinding[] {
    return [
        ...defaultKeymap,
        completionKeymap,
        {
            key: 'Mod-z',
            run: (target): boolean => undo(target),
        },
        { key: 'Mod-Shift-z', run: (target): boolean => redo(target) },
    ] as KeyBinding[];
}

export default createBoundKeymap;
