import OpenAPIRendererPlugin from 'core/openapi-renderer-plugin';
import { App, Modal, Notice, Setting } from 'obsidian';
import { Specification } from 'indexedDB/database/specification';
import { createRoot, Root } from 'react-dom/client';
import Application from 'ui/views/OpenAPI Version/components/modes/normal/modals/save-current-version-modal/components/Application';

export interface ModalFormData {
    priority?: string;
    status?: string;
    changeType?: string;
    description?: string;
    tags?: string;
    specName?: string;
    specVersion?: string;
}

export class SaveCurrentVersionModal extends Modal {
    root: Root | undefined = undefined;

    constructor(
        readonly app: App,
        private readonly plugin: OpenAPIRendererPlugin,
        private versions: Specification[],
        private readonly onSubmit: (data: ModalFormData) => void
    ) {
        super(app);
        this.setTitle('Save current version');
        this.contentEl.addClass('openapi-renderer-settings');
    }

    async onOpen(): Promise<void> {
        this.root = createRoot(this.contentEl.createEl('div'));

        this.root.render(
            <Application
                app={this.app}
                plugin={this.plugin}
                modal={this}
                onSubmit={this.onSubmit}
                versions={this.versions}
            />
        );
    }

    onClose(): void {
        this.root?.unmount();
        this.contentEl.empty();
    }
}
