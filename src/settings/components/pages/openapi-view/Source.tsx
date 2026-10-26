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
 * Source editor theme settings.
 */
const Source: React.FC = () => {
    const { app, plugin } = useSettingsContext();

    const publishSourceThemeChange = () => {
        plugin.publisher.publish({
            eventID: EventID.OpenAPIThemeChangeState,
            timestamp: new Date(),
            emitter: app.workspace,
            data: {
                mode: 'source',
            },
        } as OpenAPIThemeChangeState);
    };

    return (
        <>
            <OSetting name={'Source theme mode'}>
                <ODropdown
                    value={plugin.settings.OpenAPISourceThemeMode}
                    options={{
                        dark: 'Dark',
                        light: 'Light',
                    }}
                    onChange={async (value: string) => {
                        plugin.settings.OpenAPISourceThemeMode = value;
                        await plugin.settingsManager.saveSettings();
                        publishSourceThemeChange();
                    }}
                />
            </OSetting>

            <OSetting
                name={'Synchronize source theme'}
                desc={'Synchronize source theme mode with Obsidian theme mode'}
            >
                <OToggle
                    value={plugin.settings.syncOpenAPISourceTheme}
                    onChange={async (value) => {
                        plugin.settings.syncOpenAPISourceTheme = value;
                        await plugin.settingsManager.saveSettings();
                        publishSourceThemeChange();
                    }}
                />
            </OSetting>

            <OSetting name={'Source light theme'}>
                <ODropdown
                    value={plugin.settings.OpenAPISourceLightTheme}
                    options={{
                        default: 'Default',
                        vscode: 'VS Code Light',
                    }}
                    onChange={async (value) => {
                        plugin.settings.OpenAPISourceLightTheme = value;
                        await plugin.settingsManager.saveSettings();
                        publishSourceThemeChange();
                    }}
                />
            </OSetting>

            <OSetting name={'Source dark theme'}>
                <ODropdown
                    value={plugin.settings.OpenAPISourceDarkTheme}
                    options={{
                        default: 'Default',
                        vscode: 'VS Code Dark',
                    }}
                    onChange={async (value) => {
                        plugin.settings.OpenAPISourceDarkTheme = value;
                        await plugin.settingsManager.saveSettings();
                        publishSourceThemeChange();
                    }}
                />
            </OSetting>
        </>
    );
};

export default Source;
