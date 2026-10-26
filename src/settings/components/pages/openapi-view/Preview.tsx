import { EventID } from 'events-management/typing/constants';
import { OpenAPIThemeChangeState } from 'events-management/typing/interfaces';
import React from 'react';
import {
    ODropdown,
    OSetting,
    OToggle,
} from '@obsidian-lib/native-react-components';
import { useSettingsContext } from 'settings/components/core/context';

/**
 * Swagger UI preview theme settings.
 */
const Preview: React.FC = () => {
    const { app, plugin } = useSettingsContext();

    return (
        <>
            <OSetting name={'Preview theme mode'}>
                <ODropdown
                    value={plugin.settings.OpenAPIPreviewTheme}
                    options={{
                        dark: 'Dark',
                        light: 'Light',
                    }}
                    onChange={async (value) => {
                        plugin.settings.OpenAPIPreviewTheme = value;
                        await plugin.settingsManager.saveSettings();
                    }}
                />
            </OSetting>

            <OSetting
                name={'Synchronize preview theme'}
                desc={'Synchronize preview theme mode with Obsidian theme mode'}
            >
                <OToggle
                    value={plugin.settings.syncOpenAPIPreviewTheme}
                    onChange={async (value) => {
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
                    }}
                />
            </OSetting>
        </>
    );
};

export default Preview;
