import { TextFileView, TFile, WorkspaceLeaf } from 'obsidian';
import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { LanguageSupport } from '@codemirror/language';
import OpenAPIRendererPlugin from '../core/OpenAPIRendererPlugin';
import { EditorController } from './controllers/editor-controller';

export const SWAGGER_EDITOR_TYPE = 'yaml-json-view';

export class SwaggerEditor extends TextFileView {
    editor!: EditorView;
    currentTheme!: Extension;
    currentThemeMode!: string;
    languageExtension!: () => LanguageSupport;
    followHandler: any;
    controller: EditorController;

    constructor(
        leaf: WorkspaceLeaf,
        public plugin: OpenAPIRendererPlugin
    ) {
        super(leaf);
        this.controller = new EditorController(this);
    }

    async onOpen(): Promise<void> {
        await super.onOpen();
    }

    async onClose(): Promise<void> {
        this.data = '';
        this.editor?.destroy();
    }

    getViewType(): string {
        return SWAGGER_EDITOR_TYPE;
    }

    async onLoadFile(file: TFile): Promise<void> {
        await super.onLoadFile(file);
        this.controller.initializeEditor();
    }

    getViewData(): string {
        return this.editor.state.doc.toString();
    }

    setViewData(data: string, clear: boolean): void {
        this.data = data;
        if (clear) {
            this.clear();
        }
    }

    clear(): void {
        this.editor?.destroy();
    }

    async onunloadFile(file: TFile) {
        this.clear();
    }
}
