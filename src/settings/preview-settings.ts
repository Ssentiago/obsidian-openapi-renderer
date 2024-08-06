import {
    OpenAPIPreviewThemeStateEvent,
    SettingSectionParams,
    SettingsSection,
} from 'typing/interfaces';
import { App, DropdownComponent, Setting } from 'obsidian';
import OpenAPIRendererPlugin from '../core/OpenAPIRendererPlugin';
import { OpenAPIRendererEventPublisher } from 'pluginEvents/eventManager';
import { eventID, eventPublisher, Subject } from 'typing/constants';

export class PreviewSettings implements SettingsSection {
    app: App;
    plugin: OpenAPIRendererPlugin;
    publisher: OpenAPIRendererEventPublisher;

    constructor({ app, plugin, publisher }: SettingSectionParams) {
        this.app = app;
        this.plugin = plugin;
        this.publisher = publisher;
    }

    display(containerEl: HTMLElement): void {
        const { settings } = this.plugin;

        new Setting(containerEl)
            .setName('OpenAPI preview theme mode')
            .setDesc('Select the theme mode for OpenAPI preview')
            .addDropdown((drowdown: DropdownComponent) =>
                drowdown
                    .addOptions({
                        dark: 'Dark',
                        light: 'Light',
                    })
                    .setValue(settings.OpenAPIPreviewTheme)
                    .onChange(async (value: string) => {
                        settings.OpenAPIPreviewTheme = value;
                        await this.plugin.settingsManager.saveSettings();
                        this.publisher.publish({
                            eventID: eventID.PreviewThemeState,
                            publisher: eventPublisher.Settings,
                            subject: Subject.Preview,
                            timestamp: new Date(),
                            emitter: this.app.workspace,
                        } as OpenAPIPreviewThemeStateEvent);
                    })
            );

        new Setting(containerEl)
            .setName('Synchronize OpenAPI preview theme')
            .setDesc(
                'Synchronize OpenAPI preview theme mode with Obsidian theme mode'
            )
            .addToggle((toggle) =>
                toggle
                    .setValue(settings.synchronizeOpenAPIPreviewTheme)
                    .onChange(async (value) => {
                        settings.synchronizeOpenAPIPreviewTheme = value;
                        await this.plugin.settingsManager.saveSettings();
                        this.publisher.publish({
                            eventID: eventID.PreviewThemeState,
                            publisher: eventPublisher.Settings,
                            subject: Subject.Plugin,
                            timestamp: new Date(),
                            emitter: this.app.workspace,
                        } as OpenAPIPreviewThemeStateEvent);
                        // this.settingsTab.display(this.position);
                    })
            );
    }
}
