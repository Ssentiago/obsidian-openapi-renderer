import { App, Setting } from 'obsidian';
import React, { useEffect } from 'react';
import { EventID } from 'events-management/typing/constants';
import { ChangeGridColumnsStateEvent } from 'events-management/typing/interfaces';
import { useSettingsContext } from 'settings/components/core/context';
import { SettingsContainer } from '../styled/container-styled';

/**
 * A React component that renders the OpenAPI Entry settings section.
 *
 * This component renders several settings:
 *  - Grid Layout Columns
 *
 *
 * @returns {React.ReactElement} A React element.
 */
const OpenAPIEntrySection: React.FC = () => {
    const { ref } = useSettingsContext();
    const { app, plugin } = useSettingsContext();

    useEffect(() => {
        if (ref.current) {
            const containerEl = ref.current as HTMLElement;
            new Setting(containerEl)
                .setName('Grid Layout Columns')
                .addDropdown((dropdown) => {
                    for (let i = 1; i < 6; i++) {
                        const n = i.toString();
                        dropdown.addOption(n, n);
                    }
                    dropdown.setValue(
                        plugin.settings.OpenAPIEntryGridLayoutColumns.toString()
                    );
                    dropdown.onChange(async (value) => {
                        dropdown.setValue(value);
                        plugin.settings.OpenAPIEntryGridLayoutColumns =
                            parseInt(value, 10);
                        await plugin.settingsManager.saveSettings();
                        plugin.publisher.publish({
                            eventID: EventID.ChangeGridColumnsState,
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

export default OpenAPIEntrySection;
