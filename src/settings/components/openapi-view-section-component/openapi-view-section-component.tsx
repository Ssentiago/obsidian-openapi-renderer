import React, { useEffect } from 'react';
import { App, Setting } from 'obsidian';
import OpenAPIRendererPlugin from '../../../core/OpenAPIRendererPlugin';
import { eventID, eventPublisher, Subject } from '../../../typing/constants';
import { ChangeOpenAPIModeStateEvent } from '../../../typing/interfaces';

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
                                subject: Subject.Plugin,
                                timestamp: new Date(),
                                emitter: app.workspace,
                                publisher: eventPublisher.Settings,
                            } as ChangeOpenAPIModeStateEvent);
                        });
                });
        }
    }, [containerEl]);

    return null;
};

export default OpenAPIViewSectionComponent;
