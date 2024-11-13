import { EventID } from 'events-management/typing/constants';
import { ChangeGridColumnsStateEvent } from 'events-management/typing/interfaces';
import React from 'react';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import { useSettingsContext } from 'settings/components/core/context';

/**
 * A React component that renders the OpenAPI Entry settings section.
 *
 * This component renders several settings:
 *  - Grid Layout Columns
 *
 *
 * @returns {React.ReactElement} A React element.
 */
const OpenAPIEntry: React.FC = () => {
    const { app, plugin } = useSettingsContext();

    return (
        <>
            <ReactObsidianSetting
                name={'Grid Layout Columns'}
                addDropdowns={[
                    (dropdown) => {
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
                        return dropdown;
                    },
                ]}
            />
        </>
    );
};

export default OpenAPIEntry;
