import { OpenAPISource } from '../OpenAPI-source';
import { SourceUtils } from './source-utils';
import { ThemeController } from './theme-controller';

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
        } else {
            this.editor.editor.dispatch({
                changes: {
                    from: 0,
                    to: this.editor.editor.state.doc.length,
                    insert: this.editor.view.data,
                },
            });
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
