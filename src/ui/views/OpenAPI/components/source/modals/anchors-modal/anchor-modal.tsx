import { App, Modal } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';
import Application from 'ui/views/OpenAPI/components/source/modals/anchors-modal/components/Application';
import { OpenAPISource } from 'ui/views/OpenAPI/components/source/openapi-source';

export class AnchorModal extends Modal {
    root: Root | undefined = undefined;

    constructor(
        app: App,
        public source: OpenAPISource
    ) {
        super(app);
        this.setTitle('Anchors');
    }

    public onOpen(): void {
        const { contentEl } = this;

        this.root = createRoot(contentEl.createEl('div'));
        this.root.render(<Application source={this.source} modal={this} />);
    }

    public onClose(): void {
        this.root?.unmount();
        this.contentEl.empty();
    }
}
