import React, { useEffect } from 'react';
import { App, DropdownComponent, Setting } from 'obsidian';
import OpenAPIRendererPlugin from '../../../core/OpenAPIRendererPlugin';
import { eventID, eventPublisher, Subject } from '../../../typing/constants';
import { SourceThemeStateEvent } from '../../../typing/interfaces';

const SourceSectionComponent: React.FC<{
    app: App;
    plugin: OpenAPIRendererPlugin;
    containerEl: HTMLElement | null;
}> = ({ app, plugin, containerEl }) => {
    useEffect(() => {
        if (containerEl) {
            new Setting(containerEl)
                .setName('OpenAPI source theme mode')
                .setDesc('Select the theme mode for OpenAPI source mode')
                .addDropdown((dropdown: DropdownComponent) =>
                    dropdown
                        .addOptions({
                            dark: 'Dark',
                            light: 'Light',
                        })
                        .setValue(plugin.settings.OpenAPISourceThemeMode)
                        .onChange(async (value: string) => {
                            plugin.settings.OpenAPISourceThemeMode = value;
                            await plugin.settingsManager.saveSettings();
                            plugin.publisher.publish({
                                eventID: eventID.SourceThemeState,
                                publisher: eventPublisher.Settings,
                                subject: Subject.Plugin,
                                timestamp: new Date(),
                                emitter: app.workspace,
                            } as SourceThemeStateEvent);
                        })
                );

            new Setting(containerEl)
                .setName('Synchronize OpenAPI source theme')
                .setDesc(
                    'Synchronize OpenAPI source theme mode with Obsidian theme mode'
                )
                .addToggle((toggle) =>
                    toggle
                        .setValue(plugin.settings.synchronizeOpenAPISourceTheme)
                        .onChange(async (value) => {
                            plugin.settings.synchronizeOpenAPISourceTheme =
                                value;
                            await plugin.settingsManager.saveSettings();
                            plugin.publisher.publish({
                                eventID: eventID.SourceThemeState,
                                publisher: eventPublisher.Settings,
                                subject: Subject.Plugin,
                                timestamp: new Date(),
                                emitter: app.workspace,
                            } as SourceThemeStateEvent);
                        })
                );

            new Setting(containerEl)
                .setName('OpenAPI source light theme')
                .setDesc('Select the light theme for OpenAPI source')
                .addDropdown((dropdown) => {
                    dropdown
                        .addOptions({
                            default: 'Default',
                            vscode: 'VS Code Light',
                        })
                        .setValue(plugin.settings.OpenAPISourceLightTheme)
                        .onChange(async (value) => {
                            plugin.settings.OpenAPISourceLightTheme = value;
                            await plugin.settingsManager.saveSettings();
                            plugin.publisher.publish({
                                eventID: eventID.SourceThemeState,
                                publisher: eventPublisher.Settings,
                                subject: Subject.Plugin,
                                timestamp: new Date(),
                                emitter: app.workspace,
                            } as SourceThemeStateEvent);
                        });
                });

            new Setting(containerEl)
                .setName('OpenAPI source dark theme')
                .setDesc('Select the dark theme for OpenAPI source')
                .addDropdown((dropdown) => {
                    dropdown
                        .addOptions({
                            default: 'Default',
                            vscode: 'VS Code Dark',
                        })
                        .setValue(plugin.settings.OpenAPISourceDarkTheme)
                        .onChange(async (value) => {
                            plugin.settings.OpenAPISourceDarkTheme = value;
                            await plugin.settingsManager.saveSettings();
                            plugin.publisher.publish({
                                eventID: eventID.SourceThemeState,
                                publisher: eventPublisher.Settings,
                                subject: Subject.Plugin,
                                timestamp: new Date(),
                                emitter: app.workspace,
                            } as SourceThemeStateEvent);
                        });
                });
        }
    }, [containerEl]);

    return null;
};

export default SourceSectionComponent;
