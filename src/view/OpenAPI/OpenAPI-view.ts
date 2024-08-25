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
import {
    IOpenAPIViewComponent,
    SwitchModeStateEvent,
    UpdateOpenAPIViewStateEvent,
} from 'typing/interfaces';
import { OPENAPI_VIEW_TYPE } from '../types';

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
        this.mode = plugin.settings.OpenAPIViewDefaultMode as RenderingMode;
        this.controller = new OpenAPIController(this);
        this.source = new OpenAPISource(this, plugin, this.sourceContainer);
        this.preview = new OpenAPIPreview(this, plugin, this.previewContainer);
        this.initializeComponent();
        this.plugin.observer.subscribe(
            this.app.workspace,
            eventID.UpdateOpenAPIViewState,
            async (event: UpdateOpenAPIViewStateEvent) => {
                const file = event.data.file;
                if (this.file && this.file.path === file) {
                    const content = await this.app.vault.cachedRead(this.file);
                    this.setViewData(content, true);
                    await this.onLoadFile(this.file);
                }
            }
        );
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
        this.source.close();
        this.preview.close();
    }

    getViewType(): string {
        return OPENAPI_VIEW_TYPE;
    }

    getIcon(): IconName {
        return 'file-code';
    }

    getDisplayText(): string {
        if (this.file) {
            return `OpenAPI View: ${this.file.name}`;
        }
        return 'No file open';
    }

    onSwitch(): void {
        this.data = this.activeComponent.getComponentData();
        this.activeComponent.hide();
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
        this.preview.clear();
        this.source.clear();
        this.plugin.publisher.publish({
            eventID: eventID.SwitchModeState,
            publisher: eventPublisher.OpenAPIView,
            subject: Subject.All,
            timestamp: new Date(),
            emitter: this.app.workspace,
        } as SwitchModeStateEvent);
    }

    async onUnloadFile(file: TFile): Promise<void> {}
}
