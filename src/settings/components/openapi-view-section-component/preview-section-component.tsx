import { App, DropdownComponent, Setting } from 'obsidian';
import React, { useEffect } from 'react';
import OpenAPIRendererPlugin from '../../../core/OpenAPIRendererPlugin';
import { eventID } from '../../../events-management/typing/constants';
import { OpenAPIPreviewThemeStateEvent } from '../../../events-management/typing/interfaces';

const PreviewSectionComponent: React.FC<{
    app: App;
    plugin: OpenAPIRendererPlugin;
    containerEl: HTMLElement | null;
}> = ({ app, plugin, containerEl }) => {
    useEffect(() => {
        if (containerEl) {
            new Setting(containerEl)
                .setName('OpenAPI preview theme mode')
                .setDesc('Select the theme mode for OpenAPI preview')
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
                                eventID: eventID.PreviewThemeState,
                                timestamp: new Date(),
                                emitter: app.workspace,
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
                        .setValue(
                            plugin.settings.synchronizeOpenAPIPreviewTheme
                        )
                        .onChange(async (value) => {
                            plugin.settings.synchronizeOpenAPIPreviewTheme =
                                value;
                            await plugin.settingsManager.saveSettings();
                            plugin.publisher.publish({
                                eventID: eventID.PreviewThemeState,
                                timestamp: new Date(),
                                emitter: app.workspace,
                            } as OpenAPIPreviewThemeStateEvent);
                        })
                );
        }
    }, [containerEl]);

    return null;
};

export default PreviewSectionComponent;
