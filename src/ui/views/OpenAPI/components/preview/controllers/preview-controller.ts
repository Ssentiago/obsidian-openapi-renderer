import { PreviewUtilController } from 'ui/views/OpenAPI/components/preview/controllers/preview-util-controller';
import { RenderController } from 'ui/views/OpenAPI/components/preview/controllers/render-controller';
import { ThemeController } from 'ui/views/OpenAPI/components/preview/controllers/theme-controller';
import OpenAPIPreview from 'ui/views/OpenAPI/components/preview/openapi-preview';

export default class OpenAPIPreviewController {
    public themeController: ThemeController;
    public renderController: RenderController;
    public previewUtilController: PreviewUtilController;

    constructor(public preview: OpenAPIPreview) {
        this.themeController = new ThemeController(this);
        this.renderController = new RenderController(this);
        this.previewUtilController = new PreviewUtilController(this);

        this.initializeTheme();
        this.setupEventListeners();
    }

    /**
     * Initializes the preview.
     *
     * This method is called when the preview opens.
     * It initializes the theme controller, sets up the actions,
     * initializes the Swagger UI bundle, and shows the preview.
     *
     * @returns {Promise<void>} A promise that resolves when the preview is initialized.
     */
    async initializePreview(): Promise<void> {
        this.initializeActions();
        this.preview.show();
    }

    /**
     * Renders the preview.
     *
     * @returns {Promise<void>} No return value.
     */
    async render(): Promise<void> {
        await this.renderController.render();
    }

    /**
     * Initializes the theme of the preview.
     *
     * @returns {void} No return value.
     */
    private initializeTheme(): void {
        this.themeController.initializeTheme();
    }

    /**
     * Sets up event listeners.
     *
     * @returns {void}
     */
    private setupEventListeners(): void {
        this.previewUtilController.setupEventListeners();
    }

    /**
     * Initializes the actions for the preview component.
     *
     * @returns {void} No return value.
     */
    private initializeActions(): void {
        this.previewUtilController.initializeActions();
    }
}
