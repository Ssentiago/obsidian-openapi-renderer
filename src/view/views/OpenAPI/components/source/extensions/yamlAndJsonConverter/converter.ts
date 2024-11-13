import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import OpenAPIRendererPlugin from 'core/openapi-renderer-plugin';
import jsyaml from 'js-yaml';
import { TFile } from 'obsidian';
import path from 'path';
import { OpenAPIView } from 'view/views/OpenAPI/openapi-view';
import { OpenAPISource } from 'view/views/OpenAPI/components/source/openapi-source';

/**
 * Converts given YAML text to JSON.
 *
 * @param text the YAML text to be converted
 * @returns the converted JSON text
 */
function convertYamlToJson(text: string): string {
    return JSON.stringify(jsyaml.load(text), null, 2);
}

/**
 * Converts given JSON text to YAML.
 *
 * @param text the JSON text to be converted
 * @returns the converted YAML text
 */
function convertJsonToYaml(text: string): string {
    return jsyaml.dump(JSON.parse(text));
}

/**
 * Converts given file content from YAML to JSON or vice versa.
 *
 * @param file the file whose content is to be converted
 * @param text the file content as a string
 * @returns an object containing the converted content and the new file extension or undefined if the conversion fails
 *
 * @throws {Error} if the file extension is not supported
 */
function getConvertedContent(
    file: TFile,
    text: string,
    plugin: OpenAPIRendererPlugin
):
    | {
          newContent: string;
          newFileExt: string;
      }
    | undefined {
    let newContent: string;
    let newFileExt: string;

    try {
        switch (file.extension) {
            case 'yaml':
            case 'yml':
                newFileExt = 'json';
                newContent = convertYamlToJson(text);
                break;
            case 'json':
                newFileExt = 'yaml';
                newContent = convertJsonToYaml(text);
                break;
            default:
                return undefined;
        }
    } catch (error: any) {
        plugin.showNotice(
            'Cannot convert this file! Please check the logs for more info'
        );
        plugin.logger.error(error.message);
        return undefined;
    }

    return {
        newContent: newContent,
        newFileExt: newFileExt,
    };
}

/**
 * Updates the file in the vault with new content and a new extension.
 * @param editor The OpenAPIView instance.
 * @param file The file to update.
 * @param newContent The new content of the file.
 * @param newFileExt The new extension of the file.
 * @returns A promise that resolves when the file has been updated.
 */
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

/**
 * Converts the file content to a new format (JSON to YAML or vice versa), updates the file in the vault and updates the source editor with the new content.
 * @param view The OpenAPIView instance.
 * @param source The OpenAPISource instance.
 * @returns A promise that resolves with a boolean indicating if the conversion was successful. It returns undefined if the conversion failed.
 */
export function convertFile(view: OpenAPIView, source: OpenAPISource) {
    return async (): Promise<boolean | undefined> => {
        const file = view.file;
        if (!file) {
            return false;
        }
        const text = source.editor?.state.doc.toString();

        if (!text) {
            return false;
        }

        const converted = getConvertedContent(file, text, view.plugin);
        if (!converted) {
            return undefined;
        }
        const { newContent, newFileExt } = converted;

        try {
            await updateFile(view, file, newContent, newFileExt);
            if (source.editor) {
                const transaction = source.editor.state.update({
                    changes: {
                        from: 0,
                        to: source.editor.state.doc.length,
                        insert: newContent,
                    },
                });
                source.editor.dispatch(transaction);
                source.controller.extensionController.languageExtension =
                    newFileExt === 'json' ? json : yaml;
                source.editor.dispatch({
                    effects:
                        source.controller.extensionController.languageConfigurator.reconfigure(
                            source.controller.extensionController.languageExtension()
                        ),
                });
                source.plugin.showNotice(`Converted`);
                return true;
            }
        } catch (e: any) {
            source.plugin.showNotice(e.message);
        }
        return undefined;
    };
}
