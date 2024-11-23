import { App, Modal, Notice, Setting } from 'obsidian';

export class CreateFileModal extends Modal {
    fileName!: string;
    private submitted = false;

    constructor(
        app: App,
        public dest: string
    ) {
        super(app);
        this.titleEl.textContent = 'Create File';
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.addClass('openapi-renderer-settings');

        new Setting(contentEl).setName('Filename').addText((input) => {
            input.setPlaceholder('openapi-spec.yaml').onChange((value) => {
                input.setValue(value);
                this.fileName = value;
            });
        });

        new Setting(contentEl).addButton((button) => {
            button.setButtonText('Submit');
            button.onClick((cb) => {
                if (this.fileName) {
                    this.submitted = true;
                    this.close();
                } else {
                    new Notice('Please fill fields');
                }
            });
        });
    }

    async onClose(): Promise<void> {
        this.contentEl.empty();
        if (!this.submitted) {
            return;
        }

        if (this.fileName) {
            const filePath = `${this.dest}/${this.fileName}`;
            await this.app.vault.create(filePath, '');
            new Notice(`Created file ${this.dest}/${this.fileName}`);
        }
    }
}
