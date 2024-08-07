import {
    SettingSectionParams,
    SettingsSection,
    SourceThemeStateEvent,
} from 'typing/interfaces';
import { App, DropdownComponent, Setting } from 'obsidian';
import OpenAPIRendererPlugin from '../core/OpenAPIRendererPlugin';
import { OpenAPIRendererEventPublisher } from 'pluginEvents/eventManager';
import { eventID, eventPublisher, Subject } from 'typing/constants';

export class SourceSettings implements SettingsSection {
    app: App;
    plugin: OpenAPIRendererPlugin;
    publisher: OpenAPIRendererEventPublisher;

    constructor({ app, plugin, publisher }: SettingSectionParams) {
        this.app = app;
        this.plugin = plugin;
        this.publisher = publisher;
    }

    display(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName('OpenAPI editor theme mode')
            .setDesc('Select the theme mode for OpenAPI editor')
            .addDropdown((dropdown: DropdownComponent) =>
                dropdown
                    .addOptions({
                        dark: 'Dark',
                        light: 'Light',
                    })
                    .setValue(this.plugin.settings.OpenAPISourceThemeMode)
                    .onChange(async (value: string) => {
                        this.plugin.settings.OpenAPISourceThemeMode = value;
                        await this.plugin.settingsManager.saveSettings();
                        this.publisher.publish({
                            eventID: eventID.SourceThemeState,
                            publisher: eventPublisher.Settings,
                            subject: Subject.Plugin,
                            timestamp: new Date(),
                            emitter: this.app.workspace,
                        } as SourceThemeStateEvent);
                    })
            );

        new Setting(containerEl)
            .setName('Synchronize OpenAPI editor theme')
            .setDesc(
                'Synchronize OpenAPI editor theme mode with Obsidian theme mode'
            )
            .addToggle((toggle) =>
                toggle
                    .setValue(
                        this.plugin.settings.synchronizeOpenAPISourceTheme
                    )
                    .onChange(async (value) => {
                        this.plugin.settings.synchronizeOpenAPISourceTheme =
                            value;
                        await this.plugin.settingsManager.saveSettings();
                        this.publisher.publish({
                            eventID: eventID.SourceThemeState,
                            publisher: eventPublisher.Settings,
                            subject: Subject.Plugin,
                            timestamp: new Date(),
                            emitter: this.app.workspace,
                        } as SourceThemeStateEvent);
                    })
            );

        new Setting(containerEl)
            .setName('OpenAPI editor light theme')
            .setDesc('Select the light theme for OpenAPI editor')
            .addDropdown((dropdown) => {
                dropdown
                    .addOptions({
                        default: 'Default',
                        vscode: 'VS Code Light',
                    })
                    .setValue(this.plugin.settings.OpenAPISourceLightTheme)
                    .onChange(async (value) => {
                        this.plugin.settings.OpenAPISourceLightTheme = value;
                        await this.plugin.settingsManager.saveSettings();
                        this.publisher.publish({
                            eventID: eventID.SourceThemeState,
                            publisher: eventPublisher.Settings,
                            subject: Subject.Plugin,
                            timestamp: new Date(),
                            emitter: this.app.workspace,
                        } as SourceThemeStateEvent);
                    });
            });

        new Setting(containerEl)
            .setName('OpenAPI editor dark theme')
            .setDesc('Select the dark theme for OpenAPI editor')
            .addDropdown((dropdown) => {
                dropdown
                    .addOptions({
                        default: 'Default',
                        vscode: 'VS Code Dark',
                    })
                    .setValue(this.plugin.settings.OpenAPISourceDarkTheme)
                    .onChange(async (value) => {
                        this.plugin.settings.OpenAPISourceDarkTheme = value;
                        await this.plugin.settingsManager.saveSettings();
                        this.publisher.publish({
                            eventID: eventID.SourceThemeState,
                            publisher: eventPublisher.Settings,
                            subject: Subject.Plugin,
                            timestamp: new Date(),
                            emitter: this.app.workspace,
                        } as SourceThemeStateEvent);
                    });
            });
    }
}
