import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import OpenAPIRendererPlugin from 'core/openapi-renderer-plugin';
import { OpenAPIView } from 'view/views/OpenAPI/openapi-view';
import { SourceComponent } from 'view/typing/interfaces';
import { SourceController } from 'view/views/OpenAPI/components/source/controllers/source-controller';

export class OpenAPISource implements SourceComponent {
    editor!: EditorView | undefined;
    currentTheme!: Extension;
    themeMode!: string;
    controller: SourceController;

    constructor(
        public view: OpenAPIView,
        public plugin: OpenAPIRendererPlugin,
        public contentEl: HTMLDivElement
    ) {
        this.controller = new SourceController(this);
    }

    /**
     * Initializes the source component.
     *
     * This method is called when the view is rendered.
     * It initializes the source component by creating the editor or updating the existing one.
     *
     * @returns {Promise<void>} No return value.
     */
    async render(): Promise<void> {
        this.controller.initializeEditor();
    }

    /**
     * Shows the source component.
     *
     * @returns {void} No return value.
     */
    show(): void {
        this.contentEl.show();
    }

    /**
     * Hides the source component.
     *
     * This method is typically used in response to the user selecting a different
     * view mode.
     *
     * @returns {void} No return value.
     */
    hide(): void {
        this.contentEl.hide();
    }

    /**
     * Clears the source component by storing the current state in the state storage.
     *
     * This method is called when the user switches to a different file.
     * It stores the current state in the state storage using the file object as the key.
     * This allows the state to be restored when the user switches back to the same file.
     *
     * @returns {void} No return value.
     */
    clear(): void {
        const state = this.editor?.state;
        const file = this.view.previousFile;
        if (state && file) {
            this.controller.renderController.stateStorage.set(file, state);
        }
    }

    /**
     * Closes the source component.
     *
     * This method is called when the view is closed.
     * It destroys the editor and clears the content element.
     *
     * @returns {void} No return value.
     */
    close(): void {
        this.editor?.destroy();
        this.contentEl.empty();
    }

    /**
     * Returns the data for this component.
     *
     * If the editor exists, this method returns its state as a string.
     * Otherwise, it returns an empty string.
     *
     * @returns {string} The data for this component.
     */
    getComponentData(): string {
        return this.editor?.state.doc.toString() ?? '';
    }
}
