import { SwaggerEditor } from '../OpenAPIEditorView';
import { ThemeManager } from './theme-manager';
import { EditorUtils } from './editor-utils';

export class EditorController {
    themeManager: ThemeManager;

    constructor(public editor: SwaggerEditor) {
        this.themeManager = new ThemeManager(this);

        this.initializeTheme();
        this.setupEventListeners();
        this.initializeActions();
    }

    initializeEditor(): void {
        EditorUtils.initializeEditor(this);
        EditorUtils.createExtensions(this);
    }

    setupEventListeners(): void {
        EditorUtils.setupEventListeners(this);
    }

    initializeActions(): void {
        EditorUtils.initializeActions(this);
    }

    initializeTheme(): void {
        this.themeManager.initializeTheme();
    }
}
