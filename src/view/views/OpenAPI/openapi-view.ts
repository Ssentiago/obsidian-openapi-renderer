import OpenAPIRendererPlugin from 'core/openapi-renderer-plugin';
import { AnchorData } from 'indexedDB/database/anchor';
import { IconName, TextFileView, TFile, WorkspaceLeaf } from 'obsidian';
import { RenderingMode } from 'view/typing/constants';
import { OpenAPIViewComponent } from 'view/typing/interfaces';
import { OPENAPI_VIEW } from 'view/typing/types';
import OpenAPIPreview from 'view/views/OpenAPI/components/preview/openapi-preview';
import { OpenAPISource } from 'view/views/OpenAPI/components/source/openapi-source';
import { OpenAPIController } from 'view/views/OpenAPI/controllers/view-controller';

export class OpenAPIView extends TextFileView {
    controller: OpenAPIController;
    source: OpenAPISource;
    preview: OpenAPIPreview;
    mode: RenderingMode;
    activeComponent!: OpenAPIViewComponent | undefined;
    sourceContainer!: HTMLDivElement;
    previewContainer!: HTMLDivElement;
    previousFile: TFile | undefined = undefined;

    anchors = new Set<AnchorData>();

    constructor(
        leaf: WorkspaceLeaf,
        public plugin: OpenAPIRendererPlugin
    ) {
        super(leaf);
        this.initializeView();
        this.source = new OpenAPISource(this, plugin, this.sourceContainer);
        this.preview = new OpenAPIPreview(this, plugin, this.previewContainer);
        this.mode = plugin.settings.OpenAPIViewDefaultMode as RenderingMode;
        this.initializeComponent();
        this.controller = new OpenAPIController(this);
    }

    initializeView(): void {
        this.containerEl.setAttr('tabindex', '0');
        this.contentEl.setAttr('tabindex', '0');

        this.sourceContainer = this.contentEl.createEl('div');
        this.sourceContainer.addClass('openapi-renderer-source-container');

        this.previewContainer = this.contentEl.createEl('div');
        this.previewContainer.addClass('openapi-renderer-preview-container');
    }

    /**
     * Initializes the active component (source or preview) based on the current mode.
     * This method is called when the view is initialized or when the mode is switched.
     * It sets the active component to either the source or preview component
     * depending on the current mode.
     *
     * @returns {void} No return value.
     */
    initializeComponent(): void {
        switch (this.mode) {
            case RenderingMode.Source:
                this.activeComponent = this.source;
                break;
            case RenderingMode.Preview:
                this.activeComponent = this.preview;
                break;
        }
    }

    /**
     * Switches the active component to either the source or preview.
     * This method is called when the mode is switched.
     * It:
     * - Retrieves the current component's data.
     * - Hides the current component.
     * - Sets the mode to the new mode.
     * - Publishes a switch event using the controller's utils.
     * - Initializes the component based on the new mode.
     * - Renders the new component.
     * - Sets focus on the content element.
     *
     * @returns {void} No return value.
     */
    onSwitch(): void {
        if (this.activeComponent) {
            this.data = this.activeComponent.getComponentData();
            this.activeComponent.hide();
            this.mode = this.controller.newMode;
            this.initializeComponent();
            this.controller.utils.publishSwitchEvent();
            this.activeComponent.render();
            this.contentEl.focus();
            if (this.mode === RenderingMode.Preview) {
                this.source.onSwitch();
            }
        }
    }

    /**
     * Cleans up the view by closing both the source and preview components.
     * This method is called when the view is closes.
     * It:
     * - Resets the data property to an empty string.
     * - Calls the close method on both the source and preview components.
     *
     * @returns {Promise<void>} A promise that resolves when the cleanup is done.
     */
    async onClose(): Promise<void> {
        this.data = '';
        this.source.close();
        this.preview.close();
    }

    getViewType(): string {
        return OPENAPI_VIEW;
    }

    getIcon(): IconName {
        return 'circle-dot';
    }

    getDisplayText(): string {
        if (this.file) {
            return `OpenAPI View: ${this.file.name}`;
        }
        return 'No file open';
    }

    /**
     * Called when a file is loaded into the view.
     * This method is called when a file is loaded into the view.
     * It:
     * - Calls the superclass's `onLoadFile` method.
     * - Fetches the anchors from the IndexedDB database.
     * - Calls the `render` method on the active component.
     *
     * @param {TFile} file The file that was loaded.
     * @returns {Promise<void>} A promise that resolves when the file is loaded.
     */
    async onLoadFile(file: TFile): Promise<void> {
        await super.onLoadFile(file);
        this.anchors = new Set<AnchorData>(await this.controller.getAnchors());
        this.activeComponent?.render();
    }

    /**
     * Cleans up the view after a file is unloaded.
     * This method is called after a file is unloaded from the view.
     * It:
     * - Calls the superclass's `onUnloadFile` method.
     * - Stores the unloaded file in the `previousFile` field.
     * @param file The unloaded file.
     * @returns {Promise<void>} A promise that resolves when the cleanup is done.
     */
    async onUnloadFile(file: TFile): Promise<void> {
        await super.onUnloadFile(file);
        this.previousFile = file;
    }

    getViewData(): string {
        return this.activeComponent?.getComponentData() ?? '';
    }

    setViewData(data: string, clear: boolean): void {
        this.data = data;
        if (clear) {
            this.clear();
        }
    }

    clear(): void {
        this.controller.utils.publishSwitchEvent();
        this.source.clear();
    }
}
