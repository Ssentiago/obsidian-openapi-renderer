import { App, Modal } from 'obsidian';
import OpenAPIRendererPlugin from 'core/OpenAPIRendererPlugin';
import { EditorSettings } from 'settings/editorSettings';
import { SettingSectionParams } from 'typing/interfaces';
import { OpenAPIRendererEventPublisher } from 'pluginEvents/eventManager';
import { PreviewSettings } from 'settings/preview-settings';

export class SettingsModal extends Modal {
    publisher: OpenAPIRendererEventPublisher;

    constructor(
        public app: App,
        private plugin: OpenAPIRendererPlugin,
        private settings: string
    ) {
        super(app);
        this.publisher = plugin.publisher;
        this.titleEl.textContent = `${this.settings} settings`;
    }

    open(): void {
        super.open();
    }

    onOpen(): void {
        const { contentEl } = this;
        const settingsContainer = contentEl.createDiv();
        settingsContainer.addClass('openapi-renderer-settings');

        const { app, plugin, publisher } = this;
        const params = { app, plugin, publisher } as SettingSectionParams;
        let settingSection: EditorSettings | PreviewSettings;

        switch (this.settings) {
            case 'Source':
                settingSection = new EditorSettings(params);
                break;
            case 'Preview':
                settingSection = new PreviewSettings(params);
                break;
            default:
                throw new Error('Unknown settings type');
        }

        settingSection.display(settingsContainer);
    }

    onClose(): void {
        super.onClose();
        this.containerEl.empty();
    }
}
