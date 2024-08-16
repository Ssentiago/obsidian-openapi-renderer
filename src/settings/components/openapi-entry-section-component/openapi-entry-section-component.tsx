import React, { useEffect } from 'react';
import { App, Setting } from 'obsidian';
import OpenAPIRendererPlugin from '../../../core/OpenAPIRendererPlugin';
import { useSettingsContext } from '../core/context';
import { eventID, eventPublisher, Subject } from '../../../typing/constants';
import { ChangeGridColumnsStateEvent } from '../../../typing/interfaces';
import { SettingsContainer } from '../container-styled-component';

const OpenAPIEntrySectionComponent: React.FC<{
    app: App;
    plugin: OpenAPIRendererPlugin;
}> = ({ app, plugin }) => {
    const { ref } = useSettingsContext();

    useEffect(() => {
        if (ref.current) {
            const containerEl = ref.current as HTMLElement;
            new Setting(containerEl)
                .setName('Grid columns')
                .addDropdown((dropdown) => {
                    for (let i = 1; i < 6; i++) {
                        const n = i.toString();
                        dropdown.addOption(n, n);
                    }
                    dropdown.setValue(
                        plugin.settings.OpenAPIEntryGridColumns.toString()
                    );
                    dropdown.onChange(async (value) => {
                        dropdown.setValue(value);
                        plugin.settings.OpenAPIEntryGridColumns = parseInt(
                            value,
                            10
                        );
                        await plugin.settingsManager.saveSettings();
                        plugin.publisher.publish({
                            eventID: eventID.ChangeGridColumnsState,
                            subject: Subject.All,
                            publisher: eventPublisher.Settings,
                            emitter: app.workspace,
                            timestamp: new Date(),
                            data: { value: parseInt(value, 10) },
                        } as ChangeGridColumnsStateEvent);
                    });
                });
        }
    });

    return (
        <SettingsContainer className={'openapi-renderer-settings'} ref={ref} />
    );
};

export default OpenAPIEntrySectionComponent;
