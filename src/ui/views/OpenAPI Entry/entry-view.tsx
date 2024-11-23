import OpenAPIRendererPlugin from 'core/openapi-renderer-plugin';
import { IconName, ItemView, WorkspaceLeaf } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';
import { OPENAPI_ENTRY_VIEW } from 'ui/typing/types';
import Application from 'ui/views/OpenAPI Entry/components/Application';
import { EntryController } from 'ui/views/OpenAPI Entry/controllers/entry-controller';

export class EntryView extends ItemView {
    reactRoot: Root | undefined = undefined;
    controller: EntryController;

    constructor(
        leaf: WorkspaceLeaf,
        public plugin: OpenAPIRendererPlugin
    ) {
        super(leaf);
        this.controller = new EntryController(this);
    }

    getViewType(): string {
        return OPENAPI_ENTRY_VIEW;
    }

    getDisplayText(): string {
        const vaultName = this.app.vault.getName();
        return `OpenAPI Entry View for vault: ${vaultName}`;
    }

    getIcon(): IconName {
        return 'view';
    }

    async onOpen(): Promise<void> {
        const { contentEl } = this;

        this.reactRoot = createRoot(contentEl.createEl('div'));
        this.reactRoot.render(
            <Application view={this} app={this.app} plugin={this.plugin} />
        );
    }

    async onClose(): Promise<void> {
        if (this.reactRoot) {
            this.reactRoot.unmount();
        }
    }
}
