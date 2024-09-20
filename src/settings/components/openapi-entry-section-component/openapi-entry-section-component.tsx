import { App, Setting } from 'obsidian';
import React, { useEffect } from 'react';
import OpenAPIRendererPlugin from '../../../core/OpenAPIRendererPlugin';
import { eventID } from '../../../events-management/typing/constants';
import { ChangeGridColumnsStateEvent } from '../../../events-management/typing/interfaces';
import { SettingsContainer } from '../container-styled-component';
import { useSettingsContext } from '../core/context';

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
