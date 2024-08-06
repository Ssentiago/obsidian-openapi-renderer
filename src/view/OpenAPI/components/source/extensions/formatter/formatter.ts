import { OpenAPISource } from '../../OpenAPI-source';
import yaml from 'js-yaml';

export function openAPIFormatter(editor: OpenAPISource): () => void {
    return () => {
        const isJson = editor.view.file?.extension === 'json';
        const content = editor.editor.state.doc.toString();
        let formatterContent: string;
        if (isJson) {
            formatterContent = JSON.stringify(JSON.parse(content), null, 2);
        } else {
            formatterContent = yaml.dump(yaml.load(content), {
                indent: 2,
            });
        }
        editor.editor.dispatch({
            changes: {
                from: 0,
                to: editor.editor.state.doc.length,
                insert: formatterContent,
            },
        });
        editor.plugin.showNotice('Formatted');
    };
}
