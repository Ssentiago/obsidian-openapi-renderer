import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { LanguageSupport } from '@codemirror/language';
import OpenAPIRendererPlugin from 'core/OpenAPIRendererPlugin';
import { SourceController } from './controllers/source-controller';
import { OpenAPIView } from 'view/OpenAPI/OpenAPI-view';
import { IOpenAPIViewComponent } from 'typing/interfaces';

export class OpenAPISource implements IOpenAPIViewComponent {
    editor!: EditorView;
    currentTheme!: Extension;
    currentThemeMode!: string;
    languageExtension!: () => LanguageSupport;
    controller: SourceController;

    constructor(
        public view: OpenAPIView,
        public plugin: OpenAPIRendererPlugin,
        public contentEl: HTMLElement
    ) {
        this.controller = new SourceController(this);
    }

    async render(): Promise<void> {
        this.controller.initializeEditor();
    }

    clear(): void {
        this.editor?.destroy();
        this.contentEl.empty();
    }

    getComponentData(): string {
        return this.editor.state.doc.toString();
    }
}
