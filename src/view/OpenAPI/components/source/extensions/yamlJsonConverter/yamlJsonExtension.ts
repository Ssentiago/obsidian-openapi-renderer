import jsyaml from 'js-yaml';
import { TFile } from 'obsidian';
import path from 'path';
import { OpenAPIView } from 'view/OpenAPI/OpenAPI-view';
import { OpenAPISource } from 'view/OpenAPI/components/source/OpenAPI-source';

function convertYaml(text: string): string {
    return JSON.stringify(jsyaml.load(text), null, 2);
}

function convertJson(text: string): string {
    return jsyaml.dump(JSON.parse(text));
}

function getConvertedContent(
    file: TFile,
    text: string
): {
    newContent: string;
    newFileExt: string;
} {
    let newContent: string;
    let newFileExt: string;
    switch (file.extension) {
        case 'yaml':
        case 'yml':
            newFileExt = 'json';
            newContent = convertYaml(text);
            break;
        case 'json':
            newFileExt = 'yaml';
            newContent = convertJson(text);
            break;
        default:
            throw new Error(`Unsupported file extension: ${file.extension}`);
    }
    return {
        newContent: newContent,
        newFileExt: newFileExt,
    };
}

async function updateFile(
    editor: OpenAPIView,
    file: TFile,
    newContent: string,
    newFileExt: string
): Promise<void> {
    const newFileName = file.name.replace(/(?<=\.).+/, newFileExt);
    const newFilePath = path.join(path.dirname(file.path), newFileName);
    await editor.plugin.app.vault.rename(file, newFilePath);
    await editor.plugin.app.vault.modify(file, newContent);
}

export function convertFile(view: OpenAPIView, editor: OpenAPISource) {
    return async (): Promise<boolean | undefined> => {
        const file = view.file;
        if (!file) {
            return false;
        }
        const text = editor.editor.state.doc.toString();

        const { newContent, newFileExt } = getConvertedContent(file, text);

        try {
            await updateFile(view, file, newContent, newFileExt);
            const transaction = editor.editor.state.update({
                changes: {
                    from: 0,
                    to: editor.editor.state.doc.length,
                    insert: newContent,
                },
            });
            editor.editor.dispatch(transaction);
            editor.plugin.showNotice(`Converted`);
            return true;
        } catch (e: any) {
            editor.plugin.showNotice(e.message);
            return undefined;
        }
    };
}
