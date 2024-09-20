import { App, Setting } from 'obsidian';
import React, { useEffect } from 'react';
import OpenAPIRendererPlugin from '../../../core/OpenAPIRendererPlugin';
import { eventID } from '../../../events-management/typing/constants';
import { ChangeOpenAPIModeStateEvent } from '../../../events-management/typing/interfaces';

const OpenAPIViewSectionComponent: React.FC<{
    app: App;
    plugin: OpenAPIRendererPlugin;
    containerEl: HTMLElement | null;
}> = ({ app, plugin, containerEl }) => {
    useEffect(() => {
        if (containerEl) {
            new Setting(containerEl)
                .setName('OpenAPI View default mode')
                .setDesc('Select default mode for viewing OpenAPI View')
                .addDropdown((dropdown) => {
                    dropdown.addOption('source', 'Source');
                    dropdown.addOption('preview', 'Preview');
                    dropdown
                        .setValue(plugin.settings.OpenAPIViewDefaultMode)
                        .onChange(async (value) => {
                            plugin.settings.OpenAPIViewDefaultMode = value;
                            await plugin.settingsManager.saveSettings();
                            plugin.publisher.publish({
                                eventID: eventID.ChangeOpenAPIModeState,
                                timestamp: new Date(),
                                emitter: app.workspace,
                            } as ChangeOpenAPIModeStateEvent);
                        });
                });
        }
    }, [containerEl]);

    return null;
};

export default OpenAPIViewSectionComponent;
