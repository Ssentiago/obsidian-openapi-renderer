import OpenAPIRendererPlugin from 'core/OpenAPIRendererPlugin';
import { RESOURCE_NAME } from 'typing/constants';
import { OpenAPIView } from 'view/OpenAPI/OpenAPI-view';
import OpenAPIPreviewController from 'view/OpenAPI/components/preview/controllers/preview-controller';
import { IOpenAPIViewComponent } from 'typing/interfaces';

export default class OpenAPIPreview implements IOpenAPIViewComponent {
    renderTimeout: NodeJS.Timeout | null = null;
    currentThemeMode!: string;
    currentThemeCSS!: RESOURCE_NAME;
    controller: OpenAPIPreviewController;
    cachedPreview: null | HTMLDivElement = null;

    constructor(
        public openAPIView: OpenAPIView,
        public plugin: OpenAPIRendererPlugin,
        public contentEl: HTMLDivElement
    ) {
        this.controller = new OpenAPIPreviewController(this);
    }

    async render(): Promise<void> {
        await this.controller.initializePreview();
        await this.controller.render();
    }

    hide(): void {
        this.contentEl.hide();
    }

    clear(): void {
        this.contentEl.empty();
        this.cachedPreview = null;
    }

    close(): void {
        this.clear();
    }

    getComponentData(): string {
        return this.openAPIView.data;
    }
}
