import { App, Modal, Setting } from 'obsidian';

export class RequestUrlModal extends Modal {
    submitted = false;

    constructor(
        app: App,
        private readonly onEnd: (url: string) => void
    ) {
        super(app);
        this.setTitle('Import OpenAPI Spec from URL');
    }

    public onOpen(): void {
        const { contentEl } = this;
        new Setting(contentEl)
            .setName('URL')
            .setDesc('Enter the URL of the open api spec')
            .addText((input) => {
                input.onChange((value) => {
                    input.setValue(value);
                });
            })
            .addButton((button) => {
                button.setIcon('save');
                const input =
                    button.buttonEl.parentElement?.querySelector('input');
                if (input) {
                    button.onClick(async () => {
                        const value = input.value;
                        this.onEnd(value);
                        this.submitted = true;
                        this.close();
                    });
                }
            });
    }

    public onClose(): void {
        if (!this.submitted) {
            this.onEnd('');
        }
        this.contentEl.empty();
    }
}
