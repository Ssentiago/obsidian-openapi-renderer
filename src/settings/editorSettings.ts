import {
    SettingSectionParams,
    SettingsSection,
    SwaggerEditorThemeStateEvent,
} from '../typing/interfaces';
import { App, DropdownComponent, Setting } from 'obsidian';
import OpenAPIRendererPlugin from '../core/OpenAPIRendererPlugin';
import { OpenAPIRendererEventPublisher } from '../pluginEvents/eventManager';
import { eventID, eventPublisher, Subject } from '../typing/constants';
import { OpenAPISettingTab } from './settings';

export class EditorSettings implements SettingsSection {
    app: App;
    plugin: OpenAPIRendererPlugin;
    publisher: OpenAPIRendererEventPublisher;
    settingsTab: OpenAPISettingTab;

    constructor(
        { app, plugin, publisher }: SettingSectionParams,
        settingsTab: OpenAPISettingTab,
        private position: number
    ) {
        this.app = app;
        this.plugin = plugin;
        this.publisher = publisher;
        this.settingsTab = settingsTab;
    }

    display(containerEl: HTMLElement) {
        new Setting(containerEl)
            .setName('SwaggerEditor theme')
            .setDesc('Select the theme for OpenAPI editor')
            .addDropdown((drowdown: DropdownComponent) =>
                drowdown
                    .addOptions({
                        dark: 'Dark',
                        light: 'Light',
                    })
                    .setValue(this.plugin.settings.swaggerEditorTheme)
                    .onChange(async (value: string) => {
                        this.plugin.settings.swaggerEditorTheme = value;
                        await this.plugin.settingsManager.saveSettings();
                        this.publisher.publish({
                            eventID: eventID.SwaggerEditorThemeState,
                            publisher: eventPublisher.Settings,
                            subject: Subject.Plugin,
                            timestamp: new Date(),
                            emitter: this.app.workspace,
                        } as SwaggerEditorThemeStateEvent);
                    })
            );

        new Setting(containerEl)
            .setName('Synchronize SwaggerEditor theme')
            .setDesc('Synchronize SwaggerEditor theme with Obsidian theme')
            .addToggle((toggle) =>
                toggle
                    .setValue(
                        this.plugin.settings.synchronizeSwaggerEditorTheme
                    )
                    .onChange(async (value) => {
                        this.plugin.settings.synchronizeSwaggerEditorTheme =
                            value;
                        await this.plugin.settingsManager.saveSettings();
                        this.publisher.publish({
                            eventID: eventID.SwaggerEditorThemeState,
                            publisher: eventPublisher.Settings,
                            subject: Subject.Plugin,
                            timestamp: new Date(),
                            emitter: this.app.workspace,
                        } as SwaggerEditorThemeStateEvent);
                        this.settingsTab.display(this.position);
                    })
            );
    }
}
