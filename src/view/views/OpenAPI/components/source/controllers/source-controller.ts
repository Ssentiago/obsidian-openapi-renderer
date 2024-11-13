import { ExtensionController } from 'view/views/OpenAPI/components/source/controllers/extension-controller';
import { RenderController } from 'view/views/OpenAPI/components/source/controllers/rendering/render-controller';
import { SourceUtilController } from 'view/views/OpenAPI/components/source/controllers/source-util-controller';
import { OpenAPISource } from 'view/views/OpenAPI/components/source/openapi-source';
import { ThemeController } from 'view/views/OpenAPI/components/source/controllers/theme-controller';

export class SourceController {
    themeController: ThemeController;
    extensionController: ExtensionController;
    utilController: SourceUtilController;
    renderController: RenderController;

    constructor(public source: OpenAPISource) {
        this.themeController = new ThemeController(this);
        this.extensionController = new ExtensionController(this);
        this.utilController = new SourceUtilController(this);
        this.renderController = new RenderController(this);

        this.initializeTheme();
    }

    /**
     * Initializes the source code editor.
     *
     * This method initializes the actions and checks if the editor has been
     * initialized. If the editor has not been initialized, it calls
     * {@link RenderController.initializeEditor}. Otherwise, it calls
     * {@link RenderController.updateEditor}. Finally, it shows the content element.
     *
     * @returns {void} No return value.
     */
    initializeEditor(): void {
        this.initializeActions();
        if (!this.source.editor) {
            this.renderController.initializeEditor();
        } else {
            this.renderController.updateEditor();
        }
        this.source.contentEl.show();
    }

    /**
     * Initializes the actions for the source component.
     *
     * This method is a proxy for {@link SourceUtilController.initializeActions}.
     *
     * @returns {void} No return value.
     */
    initializeActions(): void {
        this.utilController.initializeActions();
    }

    /**
     * Initializes the theme of the source code editor.
     *
     * This method is a proxy for {@link ThemeController.initializeTheme}.
     *
     * @returns {void} No return value.
     */
    initializeTheme(): void {
        this.themeController.initializeTheme();
    }
}
