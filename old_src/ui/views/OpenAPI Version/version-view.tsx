import OpenAPIRendererPlugin from 'core/openapi-renderer-plugin';
import { Specification } from 'indexedDB/database/specification';
import { IconName, TextFileView, TFile, WorkspaceLeaf } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';
import { OPENAPI_VERSION_VIEW } from 'ui/typing/types';
import { Application } from 'ui/views/OpenAPI Version/components/Application';
import { Controller } from 'ui/views/OpenAPI Version/controller/controller';

export class VersionView extends TextFileView {
    controller: Controller;
    reactRoot!: Root | undefined;
    versions!: Array<Specification>;

    constructor(
        leaf: WorkspaceLeaf,
        public plugin: OpenAPIRendererPlugin
    ) {
        super(leaf);
        this.controller = new Controller(this);
    }

    getViewType(): string {
        return OPENAPI_VERSION_VIEW;
    }

    getDisplayText(): string {
        if (this.file) {
            return `OpenAPI Version View: ${this.file.name}`;
        }
        return 'No file open';
    }

    async onLoadFile(file: TFile): Promise<void> {
        await super.onLoadFile(file);

        const { contentEl } = this;
        contentEl.empty();

        if (!this.file) {
            contentEl.createDiv({ text: 'No file open' });
            return;
        }

        const spec =
            await this.controller.versionController.getVersionHistory();
        if (!spec) {
            return;
        }

        this.versions = spec;

        this.reactRoot = createRoot(contentEl.createDiv());
        this.reactRoot.render(
            <Application
                specifications={spec}
                view={this}
                app={this.app}
                plugin={this.plugin}
            />
        );
    }

    async onClose(): Promise<void> {
        this.reactRoot?.unmount();
        this.contentEl.empty();
    }

    clear(): void {
        this.data = '';
    }

    getViewData(): string {
        return this.data;
    }

    setViewData(data: string, clear: boolean): void {
        this.data = data;
    }

    getIcon(): IconName {
        return 'git-compare-arrows';
    }
}
