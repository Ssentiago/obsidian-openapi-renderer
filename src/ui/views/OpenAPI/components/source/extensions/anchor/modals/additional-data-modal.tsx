import { App, Modal } from 'obsidian';
import { createRoot, Root } from 'react-dom/client';
import Application from 'ui/views/OpenAPI/components/source/extensions/anchor/modals/components/Application';

export interface SubmitData {
    label: string;
    comment: string;
}

export class AdditionalDataModal extends Modal {
    root: Root | undefined = undefined;

    constructor(
        app: App,
        private contextData: {
            string: string;
            line: number;
        },
        private onSubmit: (data: SubmitData) => void
    ) {
        super(app);
        this.setTitle('Additional data');
    }

    public onOpen(): void {
        const { contentEl } = this;

        this.root = createRoot(contentEl.createEl('div'));
        this.root.render(
            <Application
                contextData={this.contextData}
                modal={this}
                onSubmit={this.onSubmit}
            />
        );
    }

    onclose() {
        this.root?.unmount();
        this.contentEl.empty();
    }
}
