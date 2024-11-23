import { App, Modal, Setting } from 'obsidian';
import { OpenAPISource } from 'ui/views/OpenAPI/components/source/openapi-source';

export class ExtensionsModal extends Modal {
    constructor(
        app: App,
        public source: OpenAPISource
    ) {
        super(app);
        this.setTitle('Extensions');
        this.contentEl.addClass('openapi-renderer-settings');
    }

    onOpen(): void {
        const { contentEl } = this;
        const { editor } = this.source;
        if (!editor) {
            return;
        }
        contentEl.createEl('h1', { text: '' });
        contentEl.createEl('p', {
            text: 'These settings affect the local state of the extensions only in this editor. Other editors will not be affected.',
        });

        for (const option of Object.values(
            this.source.controller.extensionController.storage
        )) {
            if (!option.name) {
                continue;
            }

            const setting = new Setting(contentEl).setName(option.name);

            setting.addToggle((toggle) => {
                const state = option.compartment.get(editor.state);
                const isSet = Array.isArray(state) ? state.length > 0 : !!state;
                toggle.setValue(isSet);
                toggle.onChange((value) => {
                    editor.dispatch({
                        effects: option.compartment.reconfigure(
                            value ? option.extension : []
                        ),
                    });
                });
            });
        }
    }

    onClose(): void {
        super.onClose();
        this.contentEl.empty();
    }
}
