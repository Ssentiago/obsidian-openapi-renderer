import OpenAPIRendererPlugin from 'core/openapi-renderer-plugin';
import OpenAPIPreviewController from 'ui/views/OpenAPI/components/preview/controllers/preview-controller';
import { OpenAPIView } from 'ui/views/OpenAPI/openapi-view';
import { RESOURCE_NAME } from 'ui/typing/constants';
import { PreviewComponent } from 'ui/typing/interfaces';

export default class OpenAPIPreview implements PreviewComponent {
    renderTimeout: NodeJS.Timeout | null = null;
    themeMode!: string;
    currentThemeCSS!: RESOURCE_NAME;
    controller: OpenAPIPreviewController;

    constructor(
        public openAPIView: OpenAPIView,
        public plugin: OpenAPIRendererPlugin,
        public contentEl: HTMLDivElement
    ) {
        this.controller = new OpenAPIPreviewController(this);
    }

    /**
     * Renders the preview.
     *
     * This method:
     * - Initializes the preview controller.
     * - Renders the preview.
     *
     * @returns {Promise<void>} No return value.
     */
    async render(): Promise<void> {
        await this.controller.initializePreview();
        await this.controller.render();
    }

    /**
     * Shows the preview content element.
     *
     * This method is typically used in response to the user selecting the preview
     * view mode.
     *
     * @returns {void}
     */
    show(): void {
        this.contentEl.show();
    }

    /**
     * Hides the preview content element.
     *
     * This method is typically used in response to the user selecting a different
     * view mode.
     *
     * @returns {void}
     */
    hide(): void {
        this.contentEl.hide();
    }

    /**
     * Cleans up the preview.
     *
     * This method is called when the view is closed.
     * It clears the preview content element.
     *
     * @returns {void} .
     */
    close(): void {
        this.contentEl.empty();
        this.controller.renderController.ui = undefined;
    }

    /**
     * Gets the data for this component.
     *
     * @returns {string} The data for this component.
     */
    getComponentData(): string {
        return this.openAPIView.data;
    }
}
