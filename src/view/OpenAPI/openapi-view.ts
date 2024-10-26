import OpenAPIRendererPlugin from 'core/openapi-renderer-plugin';
import { IconName, TextFileView, TFile, WorkspaceLeaf } from 'obsidian';
import OpenAPIPreview from 'view/OpenAPI/components/preview/openapi-preview';
import { OpenAPISource } from 'view/OpenAPI/components/source/openapi-source';
import { OpenAPIController } from 'view/OpenAPI/controllers/view-controller';
import { RenderingMode } from '../typing/constants';
import { OpenAPIViewComponent } from '../typing/interfaces';
import { OPENAPI_VIEW } from '../typing/types';

// FIXME баг с preview и source: панель прокрутки скачет при переключении между режимами

export class OpenAPIView extends TextFileView {
    controller: OpenAPIController;
    source: OpenAPISource;
    preview: OpenAPIPreview;
    mode: RenderingMode;
    activeComponent!: OpenAPIViewComponent | undefined;
    sourceContainer!: HTMLDivElement;
    previewContainer!: HTMLDivElement;
    previousFile: TFile | undefined = undefined;

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
     * Loads a file into the view.
     * This method is called when a file is opened and is loading into the view.
     * It:
     * - Calls the superclass's `onLoadFile` method.
     * - Renders the active component.
     * @param file The file to load.
     * @returns {Promise<void>} A promise that resolves when the file is loaded.
     */
    async onLoadFile(file: TFile): Promise<void> {
        await super.onLoadFile(file);
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
