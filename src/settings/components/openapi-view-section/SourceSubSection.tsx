import { App, DropdownComponent, Setting } from 'obsidian';
import React, { useEffect } from 'react';
import { useSettingsContext } from 'settings/components/core/context';
import { UserExtensions } from 'view/OpenAPI/components/source/typing/interfaces';
import { EventID } from 'events-management/typing/constants';
import { OpenAPIThemeChangeState } from 'events-management/typing/interfaces';

/**
 * A React component that renders the OpenAPI Source settings section.
 *
 * This component renders several settings:
 *  - Source theme mode
 *  - Synchronize source theme mode with Obsidian theme mode
 *  - Source light theme
 *  - OpenAPI source dark theme
 *
 * @param {App} app - The Obsidian app instance.
 *
 * @returns {React.ReactElement} A React element.
 */
const SourceSubSection: React.FC<{
    containerEl: HTMLElement | null;
}> = ({ containerEl }) => {
    const { app, plugin } = useSettingsContext();

    useEffect(() => {
        if (containerEl) {
            new Setting(containerEl)
                .setName('Source theme mode')
                .setDesc('Select the theme mode for source mode')
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
                                eventID: EventID.OpenAPIThemeChangeState,
                                timestamp: new Date(),
                                emitter: app.workspace,
                                data: {
                                    mode: 'source',
                                },
                            } as OpenAPIThemeChangeState);
                        })
                );

            new Setting(containerEl)
                .setName('Synchronize source theme')
                .setDesc(
                    'Synchronize source theme mode with Obsidian theme mode'
                )
                .addToggle((toggle) =>
                    toggle
                        .setValue(plugin.settings.syncOpenAPISourceTheme)
                        .onChange(async (value) => {
                            plugin.settings.syncOpenAPISourceTheme = value;
                            await plugin.settingsManager.saveSettings();
                            plugin.publisher.publish({
                                eventID: EventID.OpenAPIThemeChangeState,
                                timestamp: new Date(),
                                emitter: app.workspace,
                                data: {
                                    mode: 'source',
                                },
                            } as OpenAPIThemeChangeState);
                        })
                );

            new Setting(containerEl)
                .setName('Source light theme')
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
                                eventID: EventID.OpenAPIThemeChangeState,
                                timestamp: new Date(),
                                emitter: app.workspace,
                                data: {
                                    mode: 'source',
                                },
                            } as OpenAPIThemeChangeState);
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
                                eventID: EventID.OpenAPIThemeChangeState,
                                timestamp: new Date(),
                                emitter: app.workspace,
                                data: {
                                    mode: 'source',
                                },
                            } as OpenAPIThemeChangeState);
                        });
                });

            const extensions = containerEl.createEl('details', {});
            const summary = extensions.createEl('summary', {
                text: 'Extensions',
            });
            summary.ariaLabel =
                'These options are applied as global defaults for all the new OpenAPI Views';

            Object.entries(plugin.settings.extensions).forEach(
                ([id, extension]) => {
                    new Setting(extensions)
                        .setName(extension.name)
                        .addToggle((toggle) => {
                            toggle.setValue(extension.on);
                            toggle.onChange(async (value) => {
                                plugin.settings.extensions[
                                    id as UserExtensions
                                ].on = value;
                                await plugin.settingsManager.saveSettings();
                            });
                        });
                }
            );
        }
    }, [containerEl]);

    return null;
};

export default SourceSubSection;
