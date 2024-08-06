import { IconName, TextFileView, TFile, WorkspaceLeaf } from 'obsidian';
import OpenAPIRendererPlugin from 'core/OpenAPIRendererPlugin';
import { OpenAPISource } from 'view/OpenAPI/components/source/OpenAPI-source';
import OpenAPIPreview from 'view/OpenAPI/components/preview/OpenAPI-preview';
import { OpenAPIController } from 'view/OpenAPI/controllers/view-controller';
import {
    eventID,
    eventPublisher,
    RenderingMode,
    Subject,
} from 'typing/constants';
import { IOpenAPIViewComponent, SwitchModeStateEvent } from 'typing/interfaces';

export const OpenAPIView_TYPE = 'openapi-view';

export class OpenAPIView extends TextFileView {
    controller: OpenAPIController;
    source: OpenAPISource;
    preview: OpenAPIPreview;
    mode: RenderingMode;
    activeComponent!: IOpenAPIViewComponent;
    sourceContainer: HTMLDivElement;
    previewContainer: HTMLDivElement;

    constructor(
        leaf: WorkspaceLeaf,
        public plugin: OpenAPIRendererPlugin
    ) {
        super(leaf);
        this.contentEl.addClass('fill-height-or-more');

        this.sourceContainer = this.contentEl.createDiv({
            cls: 'openapi-renderer-source-container',
        });
        this.previewContainer = this.contentEl.createDiv({
            cls: 'openapi-renderer-preview-container',
        });
        this.mode = RenderingMode.Preview;
        this.controller = new OpenAPIController(this);
        this.source = new OpenAPISource(this, plugin, this.sourceContainer);
        this.preview = new OpenAPIPreview(this, plugin, this.previewContainer);
        this.initializeComponent();
    }

    initializeComponent(): void {
        switch (this.mode) {
            case RenderingMode.Source:
                this.activeComponent = this.source;
                break;
            case RenderingMode.Preview:
                this.activeComponent = this.preview;
                break;
            case RenderingMode.live:
                break;
            default:
                throw new Error(`Unsupported mode: ${this.mode}`);
        }
    }

    async onOpen(): Promise<void> {
        await super.onOpen();
    }

    async onClose(): Promise<void> {
        this.data = '';
        this.clear();
    }

    getViewType(): string {
        return OpenAPIView_TYPE;
    }

    onSwitch(): void {
        this.data = this.activeComponent.getComponentData();
        this.clear();
        this.controller.clearActions();
        this.mode = this.controller.newMode;
        this.plugin.publisher.publish({
            eventID: eventID.SwitchModeState,
            publisher: eventPublisher.OpenAPIView,
            subject: Subject.All,
            timestamp: new Date(),
            emitter: this.app.workspace,
        } as SwitchModeStateEvent);
        this.initializeComponent();
        this.activeComponent.render();
    }

    modifiedAddAction(
        icon: IconName,
        title: string,
        callback: (evt: MouseEvent) => any
    ): HTMLElement {
        const button = super.addAction(icon, title, callback);
        button.addClass('openapi-renderer-action-button');
        return button;
    }

    async onLoadFile(file: TFile): Promise<void> {
        await super.onLoadFile(file);
        this.activeComponent.render();
    }

    getViewData(): string {
        switch (this.mode) {
            case RenderingMode.Source:
                return this.source.getComponentData();
            case RenderingMode.Preview:
                return this.data;
            default:
                throw new Error(`Unsupported mode: ${this.mode}`);
        }
    }

    setViewData(data: string, clear: boolean): void {
        this.data = data;
        if (clear) {
            this.clear();
        }
    }

    clear(): void {
        this.activeComponent.clear();
    }

    async onUnloadFile(file: TFile): Promise<void> {
        this.clear();
        this.controller.clearActions();
    }
}
