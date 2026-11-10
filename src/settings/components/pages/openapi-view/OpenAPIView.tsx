import React from 'react';

import {
    ODetails,
    ODropdown,
    OSetting,
    OToggle,
} from '@obsidian-lib/native-react-components';
import { EventID } from 'events-management/typing/constants';
import { OpenAPIThemeChangeState } from 'events-management/typing/interfaces';
import { useSettingsContext } from 'settings/components/core/context';
import { UserExtensions } from 'ui/views/OpenAPI/components/source/typing/interfaces';

/**
 * The component that renders the OpenAPI View settings section
 *
 * @returns a JSX element representing the OpenAPI View settings section
 */
const OpenAPIView: React.FC = () => {
    const { app, plugin } = useSettingsContext();

    return (
        <>
            <OSetting
                name='Register YAML and JSON files for processing by default?'
                desc={[
                    'Enable this option to open YAML and JSON files in OpenAPI View by default.',
                    'You can still open these files via the context menu.',
                    'Changes require restarting the plugin to take effect.',
                ]}
            >
                <OToggle
                    value={plugin.settings.registerYamlJson}
                    onChange={(value) => {
                        plugin.settings.registerYamlJson = value;
                        void plugin.settingsManager.saveSettings();
                    }}
                />
            </OSetting>

            <OSetting
                name={'OpenAPI View default mode'}
                desc={'Select default mode for viewing OpenAPI View'}
            >
                <ODropdown
                    value={plugin.settings.OpenAPIViewDefaultMode}
                    options={{
                        source: 'Source',
                        preview: 'Preview',
                    }}
                    onChange={(value) => {
                        plugin.settings.OpenAPIViewDefaultMode = value;
                        void plugin.settingsManager.saveSettings();
                    }}
                />
            </OSetting>

            <OSetting
                name={'Preview'}
                heading
            />

            <OSetting name={'Preview theme mode'}>
                <ODropdown
                    value={plugin.settings.OpenAPIPreviewTheme}
                    options={{
                        dark: 'Dark',
                        light: 'Light',
                    }}
                    onChange={(value) => {
                        plugin.settings.OpenAPIPreviewTheme = value;
                        void plugin.settingsManager.saveSettings();
                    }}
                />
            </OSetting>

            <OSetting
                name={'Synchronize preview theme'}
                desc={'Synchronize preview theme mode with Obsidian theme mode'}
            >
                <OToggle
                    value={plugin.settings.syncOpenAPIPreviewTheme}
                    onChange={(value) => {
                        plugin.settings.syncOpenAPIPreviewTheme = value;
                        void plugin.settingsManager.saveSettings();
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

            <OSetting
                name={'Source'}
                heading
            />

            <OSetting name={'Source theme mode'}>
                <ODropdown
                    value={plugin.settings.OpenAPISourceThemeMode}
                    options={{
                        dark: 'Dark',
                        light: 'Light',
                    }}
                    onChange={(value: string) => {
                        plugin.settings.OpenAPISourceThemeMode = value;
                        void plugin.settingsManager.saveSettings();
                        plugin.publisher.publish({
                            eventID: EventID.OpenAPIThemeChangeState,
                            timestamp: new Date(),
                            emitter: app.workspace,
                            data: {
                                mode: 'source',
                            },
                        } as OpenAPIThemeChangeState);
                    }}
                />
            </OSetting>

            <OSetting
                name={'Synchronize source theme'}
                desc={'Synchronize source theme mode with Obsidian theme mode'}
            >
                <OToggle
                    value={plugin.settings.syncOpenAPISourceTheme}
                    onChange={(value) => {
                        plugin.settings.syncOpenAPISourceTheme = value;
                        void plugin.settingsManager.saveSettings();
                        plugin.publisher.publish({
                            eventID: EventID.OpenAPIThemeChangeState,
                            timestamp: new Date(),
                            emitter: app.workspace,
                            data: {
                                mode: 'source',
                            },
                        } as OpenAPIThemeChangeState);
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
                    onChange={(value) => {
                        plugin.settings.OpenAPISourceLightTheme = value;
                        void plugin.settingsManager.saveSettings();
                        plugin.publisher.publish({
                            eventID: EventID.OpenAPIThemeChangeState,
                            timestamp: new Date(),
                            emitter: app.workspace,
                            data: {
                                mode: 'source',
                            },
                        } as OpenAPIThemeChangeState);
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
                    onChange={(value) => {
                        plugin.settings.OpenAPISourceDarkTheme = value;
                        void plugin.settingsManager.saveSettings();
                        plugin.publisher.publish({
                            eventID: EventID.OpenAPIThemeChangeState,
                            timestamp: new Date(),
                            emitter: app.workspace,
                            data: {
                                mode: 'source',
                            },
                        } as OpenAPIThemeChangeState);
                    }}
                />
            </OSetting>

            <ODetails name={'Extensions'}>
                {Object.entries(plugin.settings.extensions).map(
                    ([id, extension]) => (
                        <OSetting
                            name={extension.name}
                            key={id}
                            noBorder
                        >
                            <OToggle
                                value={extension.on}
                                onChange={(value) => {
                                    plugin.settings.extensions[
                                        id as UserExtensions
                                    ].on = value;
                                    void plugin.settingsManager.saveSettings();
                                }}
                            />
                        </OSetting>
                    )
                )}
            </ODetails>
        </>
    );
};

export default OpenAPIView;
