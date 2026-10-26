import { EventID } from 'events-management/typing/constants';
import { ChangeGridColumnsStateEvent } from 'events-management/typing/interfaces';
import React from 'react';
import {
    ODropdown,
    OSetting,
} from '@obsidian-lib/native-react-components';
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
            <OSetting name={'Grid Layout Columns'}>
                <ODropdown
                    value={plugin.settings.OpenAPIEntryGridLayoutColumns.toString()}
                    options={{
                        1: '1',
                        2: '2',
                        3: '3',
                        4: '4',
                        5: '5',
                    }}
                    onChange={async (value) => {
                        plugin.settings.OpenAPIEntryGridLayoutColumns =
                            parseInt(value, 10);
                        await plugin.settingsManager.saveSettings();
                        plugin.publisher.publish({
                            eventID: EventID.ChangeGridColumnsState,
                            emitter: app.workspace,
                            timestamp: new Date(),
                            data: { value: parseInt(value, 10) },
                        } as ChangeGridColumnsStateEvent);
                    }}
                />
            </OSetting>
        </>
    );
};

export default OpenAPIEntry;
