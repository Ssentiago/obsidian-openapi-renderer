import OpenAPIPreview from 'view/OpenAPI/components/preview/OpenAPI-preview';
import { ThemeController } from 'view/OpenAPI/components/preview/controllers/theme-controller';
import { RenderController } from 'view/OpenAPI/components/preview/controllers/render-controller';
import { SwaggerUIBundle } from 'typing/swagger-ui-typings';
import { PreviewUtils } from 'view/OpenAPI/components/preview/controllers/preview-utils';

export default class OpenAPIPreviewController {
    public themeManager: ThemeController;
    public renderManager: RenderController;
    public swaggerUIBundle: SwaggerUIBundle | null = null;
    public previewUtils: PreviewUtils;

    constructor(public preview: OpenAPIPreview) {
        this.themeManager = new ThemeController(this);
        this.renderManager = new RenderController(this);
        this.previewUtils = new PreviewUtils(this);

        this.initializeTheme();
        this.setupEventListeners();
    }

    async initializePreview(): Promise<void> {
        this.initializeActions();
        await this.initializeSwaggerUIBundle();
    }

    async render(): Promise<void> {
        await this.renderManager.render();
    }

    private initializeTheme(): void {
        this.themeManager.initializeTheme();
    }

    private setupEventListeners(): void {
        this.previewUtils.setupEventListeners();
    }

    private initializeActions(): void {
        this.previewUtils.initializeActions();
    }

    private async initializeSwaggerUIBundle(): Promise<void> {
        await this.previewUtils.initSwaggerUIBundle();
    }
}
