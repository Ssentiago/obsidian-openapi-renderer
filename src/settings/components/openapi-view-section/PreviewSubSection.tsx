import { EventID } from 'events-management/typing/constants';
import { OpenAPIThemeChangeState } from 'events-management/typing/interfaces';
import { App, DropdownComponent, Setting } from 'obsidian';
import React, { useEffect } from 'react';
import { useSettingsContext } from 'settings/components/core/context';

/**
 * A React component that renders the preview settings section.
 *
 * This component renders several settings:
 *  - Preview theme mode
 *  - Synchronize preview theme
 *
 * @param {App} app - The Obsidian app instance.
 * @param {HTMLElement | null} containerEl - The container element to render the settings in.
 *
 * @returns {React.ReactElement} A React element.
 */
const PreviewSubSection: React.FC<{
    containerEl: HTMLElement | null;
}> = ({ containerEl }) => {
    const { app, plugin } = useSettingsContext();
    useEffect(() => {
        if (containerEl) {
            new Setting(containerEl)
                .setName('Preview theme mode')
                .setDesc('Select the theme mode for preview')
                .addDropdown((dropdown: DropdownComponent) =>
                    dropdown
                        .addOptions({
                            dark: 'Dark',
                            light: 'Light',
                        })
                        .setValue(plugin.settings.OpenAPIPreviewTheme)
                        .onChange(async (value: string) => {
                            plugin.settings.OpenAPIPreviewTheme = value;
                            await plugin.settingsManager.saveSettings();
                            plugin.publisher.publish({
                                eventID: EventID.OpenAPIThemeChangeState,
                                timestamp: new Date(),
                                emitter: app.workspace,
                                data: {
                                    mode: 'preview',
                                },
                            } as OpenAPIThemeChangeState);
                        })
                );

            new Setting(containerEl)
                .setName('Synchronize preview theme')
                .setDesc(
                    'Synchronize preview theme mode with Obsidian theme mode'
                )
                .addToggle((toggle) =>
                    toggle
                        .setValue(plugin.settings.syncOpenAPIPreviewTheme)
                        .onChange(async (value) => {
                            plugin.settings.syncOpenAPIPreviewTheme = value;
                            await plugin.settingsManager.saveSettings();
                            plugin.publisher.publish({
                                eventID: EventID.OpenAPIThemeChangeState,
                                timestamp: new Date(),
                                emitter: app.workspace,
                                data: {
                                    mode: 'preview',
                                },
                            } as OpenAPIThemeChangeState);
                        })
                );
        }
    }, [containerEl]);

    return null;
};

export default PreviewSubSection;
