import { OpenAPISource } from '../OpenAPI-source';
import { ThemeController } from './theme-controller';
import { SourceUtils } from './source-utils';

export class SourceController {
    themeManager: ThemeController;

    constructor(public editor: OpenAPISource) {
        this.themeManager = new ThemeController(this);
        this.initializeTheme();
        this.setupEventListeners();
    }

    initializeEditor(): void {
        this.initializeActions();
        this.editor.contentEl.show();
        if (!this.editor.editor) {
            SourceUtils.initializeEditor(this);
        }
    }

    setupEventListeners(): void {
        SourceUtils.setupEventListeners(this);
    }

    initializeActions(): void {
        SourceUtils.initializeActions(this);
    }

    initializeTheme(): void {
        this.themeManager.initializeTheme();
    }
}
