import { OpenAPISource } from 'view/views/OpenAPI/components/source/openapi-source';
import yaml from 'js-yaml';

export function openAPIFormatter(source: OpenAPISource): () => void {
    return () => {
        const isJson = source.view.file?.extension === 'json';
        const content = source.editor?.state.doc.toString() ?? '';
        if (!content) {
            return;
        }

        let formatterContent: string;
        try {
            if (isJson) {
                formatterContent = JSON.stringify(JSON.parse(content), null, 2);
            } else {
                formatterContent = yaml.dump(yaml.load(content), {
                    indent: 2,
                });
            }
        } catch (err: any) {
            source.plugin.showNotice(
                'Cannot format this file! Please check the logs for more info'
            );
            source.plugin.logger.error(err.message);
            return;
        }

        source.editor?.dispatch({
            changes: {
                from: 0,
                to: source.editor.state.doc.length,
                insert: formatterContent,
            },
        });
        source.plugin.showNotice('Formatted');
    };
}
