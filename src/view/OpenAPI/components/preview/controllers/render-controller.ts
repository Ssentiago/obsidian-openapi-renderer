import OpenAPIPreviewController from 'view/OpenAPI/components/preview/controllers/preview-controller';
import { RESOURCE_NAME } from 'view/typing/constants';

export class RenderController {
    ui: any;
    constructor(public controller: OpenAPIPreviewController) {}

    /**
     * Renders the Swagger UI.
     *
     * This method is called when the preview controller is initializes.
     * It renders the Swagger UI for the preview component.
     *
     * @returns {Promise<void>} A promise that resolves when the Swagger UI bundle has been rendered.
     */
    async render(): Promise<void> {
        const { contentEl } = this.controller.preview;
        await this.renderSwaggerUI(contentEl);
    }

    /**
     * Renders the Swagger UI for the preview component.
     *
     * This method is responsible for rendering the Swagger UI.
     *
     * @param containerEl The HTML element to render the Swagger UI component into.
     *
     * @returns {Promise<void>} A promise that resolves when the Swagger UI component is rendered.
     *
     * @throws If there is an error loading the CSS resources.
     */
    private async renderSwaggerUI(containerEl: HTMLDivElement): Promise<void> {
        const { plugin } = this.controller.preview;
        if (!plugin.resourceManager.swaggerUIBundle) {
            await plugin.resourceManager.initSwaggerUIBundle();
        }

        const updated = await this.updatePreview(
            await this.controller.previewUtilController.loadSpec()
        );

        if (updated) {
            return;
        }

        containerEl.empty();

        const additionalCSSName = this.controller.preview.currentThemeCSS;

        let baseCSS: string, additionalCSS: string;
        const resourceManager = this.controller.preview.plugin.resourceManager;
        try {
            baseCSS = await resourceManager.getCSS(RESOURCE_NAME.BaseCSS);
            additionalCSS = await resourceManager.getCSS(additionalCSSName);
        } catch (err: any) {
            this.controller.preview.plugin.showNotice(err.message);
            return;
        }

        const style = containerEl.createEl('style');
        style.textContent = baseCSS + additionalCSS;

        const renderContainer = containerEl.createDiv({
            cls: 'fill-height-or-more',
        });

        const parsedSpec =
            await this.controller.previewUtilController.loadSpec();

        if (!parsedSpec) {
            return;
        }

        if (!plugin.resourceManager.swaggerUIBundle) {
            return;
        }

        this.ui = plugin.resourceManager.swaggerUIBundle({
            spec: parsedSpec,
            domNode: renderContainer,
            presets: [
                plugin.resourceManager.swaggerUIBundle.presets.apis,
                plugin.resourceManager.swaggerUIBundle
                    .SwaggerUIStandalonePreset,
            ],
            layout: 'BaseLayout',
        });
    }

    /**
     * Re-renders the preview.
     *
     * This method is called when the underlying specification changes.
     * It resets the Swagger UI bundle and re-renders the preview.
     *
     * @returns {Promise<void>} A promise that resolves when the preview is re-rendered.
     */
    async rerender(): Promise<void> {
        this.ui = null;
        await this.render();
    }

    /**
     * Updates the preview with a new specification.
     *
     * This method is called when the specification file changes.
     * It updates the Swagger UI bundle with the new specification.
     *
     * @param {object} spec - The new specification.
     * @returns {Promise<boolean>} A promise that resolves to `true` if the
     *          specification was updated successfully, or `false` otherwise.
     */
    async updatePreview(spec: any): Promise<boolean> {
        if (this.ui) {
            if (spec) {
                this.ui.specActions.updateJsonSpec(spec);
                return true;
            }
        }
        return false;
    }
}
