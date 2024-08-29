import { RESOURCE_NAME } from 'typing/constants';
import OpenAPIPreviewController from 'view/OpenAPI/components/preview/controllers/preview-controller';

export class RenderController {
    private ui: any;
    constructor(public controller: OpenAPIPreviewController) {}

    async render(): Promise<void> {
        const { contentEl } = this.controller.preview;
        await this.renderSwaggerUI(contentEl);
    }

    async renderSwaggerUI(containerEl: HTMLDivElement): Promise<void> {
        const { plugin } = this.controller.preview;
        if (!plugin.resourceManager.swaggerUIBundle) {
            await plugin.resourceManager.initSwaggerUIBundle();
        }

        if (this.ui) {
            const spec = await this.controller.previewUtils.loadSpec();
            if (spec) {
                this.ui.specActions.updateJsonSpec(spec);
                return;
            }
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

        const parsedSpec = await this.controller.previewUtils.loadSpec();

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

    async rerender(): Promise<void> {
        this.ui = null;
        await this.render();
    }
}
