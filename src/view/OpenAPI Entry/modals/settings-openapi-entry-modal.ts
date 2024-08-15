import { App, Modal, Setting } from 'obsidian';
import OpenAPIRendererPlugin from '../../../core/OpenAPIRendererPlugin';
import { ChangeGridColumnsStateEvent } from '../../../typing/interfaces';
import { eventID, eventPublisher, Subject } from '../../../typing/constants';

export class SettingsOpenapiEntryModal extends Modal {
    constructor(
        app: App,
        public plugin: OpenAPIRendererPlugin
    ) {
        super(app);
        this.titleEl.textContent = 'OpenAPI Entry Settings';
    }

    onOpen(): void {
        const { contentEl } = this;

        new Setting(contentEl)
            .setName('Grid columns')
            .addDropdown((dropdown) => {
                for (let i = 1; i < 6; i++) {
                    const n = i.toString();
                    dropdown.addOption(n, n);
                }
                dropdown.onChange((value) => {
                    dropdown.setValue(value);
                    this.plugin.publisher.publish({
                        eventID: eventID.ChangeGridColumnsState,
                        subject: Subject.All,
                        publisher: eventPublisher.Settings,
                        emitter: this.app.workspace,
                        timestamp: new Date(),
                        data: { value: parseInt(value, 10) },
                    } as ChangeGridColumnsStateEvent);
                });
            });
    }

    onClose(): void {
        super.onClose();
        this.contentEl.empty();
    }
}
