import SwaggerUiCss from 'assets/swagger-ui/swagger-ui-base.css';
import SwaggerUiDarkCss from 'assets/swagger-ui/swagger-ui-dark.css';
import SwaggerUiLightCss from 'assets/swagger-ui/swagger-ui-light.css';
import { SwaggerUIBundle } from 'swagger-ui-dist';
import OpenAPIPreviewController from 'ui/views/OpenAPI/components/preview/controllers/preview-controller';

export const PREVIEW_LAYOUT_CSS = `
.fill-height-or-more {
    display: flex;
    flex-direction: column;
    min-height: 100%;
}

.fill-height-or-more > div {
    flex: 1;
    display: flex;
    flex-direction: column;
}
`;

export class RenderController {
    ui: any;
    shadowRoot: ShadowRoot | null = null;

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
     * Returns the shadow root used to host the preview, creating it if needed.
     *
     * All Swagger UI markup and styles live inside this shadow root so they
     * cannot leak into (or be affected by) the rest of the Obsidian DOM.
     *
     * @param containerEl The host element owned by the view.
     *
     * @returns {ShadowRoot} The shadow root hosting the preview.
     */
    private ensureShadowRoot(containerEl: HTMLDivElement): ShadowRoot {
        if (!this.shadowRoot || containerEl.shadowRoot !== this.shadowRoot) {
            this.shadowRoot =
                containerEl.shadowRoot ??
                containerEl.attachShadow({ mode: 'open' });
        }
        return this.shadowRoot;
    }

    /**
     * Renders the Swagger UI for the preview component.
     *
     * This method is responsible for rendering the Swagger UI.
     * Markup and styles are rendered into the shadow root of the preview
     * container, keeping the preview isolated from the host document styles.
     *
     * @param containerEl The host element to render the Swagger UI component into.
     *
     * @returns {Promise<void>} A promise that resolves when the Swagger UI component is rendered.
     *
     * @throws If there is an error loading the CSS resources.
     */
    private async renderSwaggerUI(containerEl: HTMLDivElement): Promise<void> {
        const parsedSpec =
            await this.controller.previewUtilController.loadSpec();

        const updated = await this.updatePreview(parsedSpec);

        if (updated) {
            return;
        }

        const shadowRoot = this.ensureShadowRoot(containerEl);
        shadowRoot.innerHTML = '';

        let additionalCSS = '';

        switch (this.controller.preview.themeMode) {
            case 'dark':
                additionalCSS = SwaggerUiDarkCss;
                break;
            case 'light':
                additionalCSS = SwaggerUiLightCss;
                break;
        }

        const style = document.createElement('style');
        style.textContent = `${PREVIEW_LAYOUT_CSS}\n${SwaggerUiCss}\n${additionalCSS}`;
        shadowRoot.appendChild(style);

        const renderContainer = document.createElement('div');
        renderContainer.className = 'fill-height-or-more';
        shadowRoot.appendChild(renderContainer);

        if (!parsedSpec) {
            return;
        }

        this.ui = SwaggerUIBundle({
            spec: parsedSpec,
            domNode: renderContainer,
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIBundle.SwaggerUIStandalonePreset,
            ],
            layout: 'BaseLayout',
        });
    }

    /**
     * Clears the preview.
     *
     * Removes everything rendered into the shadow root and drops the
     * Swagger UI instance. Called when the view is closed.
     *
     * @returns {void} No return value.
     */
    clear(): void {
        this.ui = undefined;
        this.shadowRoot?.replaceChildren();
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
