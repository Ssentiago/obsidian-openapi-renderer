import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { TFile } from 'obsidian';
import { LimitedMap } from 'view/OpenAPI/components/source/controllers/rendering/limitedMap';
import { SourceController } from 'view/OpenAPI/components/source/controllers/source-controller';

export class RenderController {
    stateStorage = new LimitedMap<TFile, EditorState>(50);

    constructor(public controller: SourceController) {}

    initializeEditor(): void {
        const file = this.controller.source.view.file;
        const state = this.getNewState();
        if (!file || !state) {
            return;
        }

        this.stateStorage.set(file, state);
        this.controller.source.editor = new EditorView({
            state: state,
            parent: this.controller.source.contentEl,
        });
    }

    updateEditor(): void {
        const file = this.controller.source.view.file;
        if (!file) {
            return;
        }
        const storageState = this.stateStorage.get(file);
        if (storageState) {
            this.controller.source.editor?.setState(storageState);
        } else {
            const state = this.getNewState();
            if (!state) {
                return;
            }
            this.stateStorage.set(file, state);
            this.controller.source.editor?.setState(state);
        }
    }

    private getNewState(): EditorState | undefined {
        const file = this.controller.source.view.file;
        if (!file) {
            return;
        }
        const isJson = file.extension === 'json';
        this.controller.extensionController.languageExtension = isJson
            ? json
            : yaml;

        return EditorState.create({
            doc: this.controller.source.view.data,
            extensions: this.controller.extensionController.defaultExtensions,
        });
    }
}
