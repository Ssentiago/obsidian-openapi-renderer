import { SwaggerEditor } from './OpenAPIEditorView';
import { EditorView } from '@codemirror/view';
import yaml from 'js-yaml';

export function openAPIFormatter(
    editor: SwaggerEditor,
    view: EditorView
): boolean {
    let isJson = editor.file?.extension === 'json';
    const content = view.state.doc.toString();
    let formatterContent: string;
    if (isJson) {
        formatterContent = JSON.stringify(JSON.parse(content), null, 2);
    } else {
        formatterContent = yaml.dump(yaml.load(content), {
            indent: 2,
        });
    }
    view.dispatch({
        changes: {
            from: 0,
            to: view.state.doc.length,
            insert: formatterContent,
        },
    });
    editor.plugin.showNotice('Formatted');
    return true;
}
