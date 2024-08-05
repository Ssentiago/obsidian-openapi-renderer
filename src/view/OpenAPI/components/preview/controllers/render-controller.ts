import OpenAPIPreviewController from 'view/OpenAPI/components/preview/controllers/preview-controller';
import { RESOURCE_NAME } from 'typing/constants';

export class RenderController {
    constructor(public controller: OpenAPIPreviewController) {}

    async render(): Promise<void> {
        const { contentEl } = this.controller.preview;
        contentEl.empty();

        contentEl.addClass('swagger-ui');

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

        const style = contentEl.createEl('style');
        style.textContent = baseCSS + additionalCSS;

        await this.renderSwaggerUI(contentEl);
    }

    async renderSwaggerUI(containerEl: HTMLElement): Promise<void> {
        if (!this.controller.swaggerUIBundle) {
            await this.controller.previewUtils.initSwaggerUIBundle();
        }
        if (this.controller.preview.cachedPreview) {
            containerEl.appendChild(this.controller.preview.cachedPreview);
            return;
        }

        const swaggerContainer = containerEl.createEl('div');

        const parsedSpec = await this.controller.previewUtils.loadSpec();
        if (!parsedSpec) {
            return;
        }
        if (this.controller.swaggerUIBundle) {
            this.controller.swaggerUIBundle({
                spec: parsedSpec,
                domNode: swaggerContainer,
                presets: [
                    this.controller.swaggerUIBundle.presets.apis,
                    this.controller.swaggerUIBundle.SwaggerUIStandalonePreset,
                ],
                layout: 'BaseLayout',
            });
            this.controller.preview.cachedPreview = swaggerContainer;
        }
    }

    async rerender(): Promise<void> {
        await this.render();
    }
}
