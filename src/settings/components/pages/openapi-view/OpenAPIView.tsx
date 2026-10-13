import { EventID } from 'events-management/typing/constants';
import { OpenAPIThemeChangeState } from 'events-management/typing/interfaces';
import React, { Fragment } from 'react';
import { OSetting } from '@obsidian-lib/native-react-components';
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
                name="Register YAML and JSON files for processing by default?"
                addMultiDesc={(multiDesc) => {
                    multiDesc.addDescriptions([
                        'Enable this option to open YAML and JSON files in OpenAPI View by default.',
                        'You can still open these files via the context menu.',
                        'Changes require restarting the plugin to take effect.',
                    ]);
                    return multiDesc;
                }}
                addToggles={[
                    (toggle) =>
                        toggle
                            .setValue(plugin.settings.registerYamlJson)
                            .onChange(async (value) => {
                                plugin.settings.registerYamlJson = value;
                                await plugin.settingsManager.saveSettings();
                            }),
                ]}
            />

            <OSetting
                name={'OpenAPI View default mode'}
                desc={'Select default mode for viewing OpenAPI View'}
                addDropdowns={[
                    (dropdown) => {
                        dropdown.addOption('source', 'Source');
                        dropdown.addOption('preview', 'Preview');
                        dropdown
                            .setValue(plugin.settings.OpenAPIViewDefaultMode)
                            .onChange(async (value) => {
                                plugin.settings.OpenAPIViewDefaultMode = value;
                                await plugin.settingsManager.saveSettings();
                            });
                        return dropdown;
                    },
                ]}
            />

            <OSetting name={'Preview'} heading />

            <OSetting
                name={'Preview theme mode'}
                addDropdowns={[
                    (dropdown) => {
                        dropdown.addOption('dark', 'Dark');
                        dropdown.addOption('light', 'Light');
                        dropdown
                            .setValue(plugin.settings.OpenAPIPreviewTheme)
                            .onChange(async (value) => {
                                plugin.settings.OpenAPIPreviewTheme = value;
                                await plugin.settingsManager.saveSettings();
                            });
                        return dropdown;
                    },
                ]}
            />

            <OSetting
                name={'Synchronize preview theme'}
                desc={'Synchronize preview theme mode with Obsidian theme mode'}
                addToggles={[
                    (toggle) =>
                        toggle
                            .setValue(plugin.settings.syncOpenAPIPreviewTheme)
                            .onChange(async (value) => {
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
                            }),
                ]}
            />

            <OSetting name={'Source'} heading />

            <OSetting
                name={'Source theme mode'}
                addDropdowns={[
                    (dropdown) =>
                        dropdown
                            .addOptions({
                                dark: 'Dark',
                                light: 'Light',
                            })
                            .setValue(plugin.settings.OpenAPISourceThemeMode)
                            .onChange(async (value: string) => {
                                plugin.settings.OpenAPISourceThemeMode = value;
                                await plugin.settingsManager.saveSettings();
                                plugin.publisher.publish({
                                    eventID: EventID.OpenAPIThemeChangeState,
                                    timestamp: new Date(),
                                    emitter: app.workspace,
                                    data: {
                                        mode: 'source',
                                    },
                                } as OpenAPIThemeChangeState);
                            }),
                ]}
            />

            <OSetting
                name={'Synchronize source theme'}
                desc={'Synchronize source theme mode with Obsidian theme mode'}
                addToggles={[
                    (toggle) =>
                        toggle
                            .setValue(plugin.settings.syncOpenAPISourceTheme)
                            .onChange(async (value) => {
                                plugin.settings.syncOpenAPISourceTheme = value;
                                await plugin.settingsManager.saveSettings();
                                plugin.publisher.publish({
                                    eventID: EventID.OpenAPIThemeChangeState,
                                    timestamp: new Date(),
                                    emitter: app.workspace,
                                    data: {
                                        mode: 'source',
                                    },
                                } as OpenAPIThemeChangeState);
                            }),
                ]}
            />

            <OSetting
                name={'Source light theme'}
                addDropdowns={[
                    (dropdown) =>
                        dropdown
                            .addOptions({
                                default: 'Default',
                                vscode: 'VS Code Light',
                            })
                            .setValue(plugin.settings.OpenAPISourceLightTheme)
                            .onChange(async (value) => {
                                plugin.settings.OpenAPISourceLightTheme = value;
                                await plugin.settingsManager.saveSettings();
                                plugin.publisher.publish({
                                    eventID: EventID.OpenAPIThemeChangeState,
                                    timestamp: new Date(),
                                    emitter: app.workspace,
                                    data: {
                                        mode: 'source',
                                    },
                                } as OpenAPIThemeChangeState);
                            }),
                ]}
            />

            <OSetting
                name={'Source dark theme'}
                addDropdowns={[
                    (dropdown) =>
                        dropdown
                            .addOptions({
                                default: 'Default',
                                vscode: 'VS Code Dark',
                            })
                            .setValue(plugin.settings.OpenAPISourceDarkTheme)
                            .onChange(async (value) => {
                                plugin.settings.OpenAPISourceDarkTheme = value;
                                await plugin.settingsManager.saveSettings();
                                plugin.publisher.publish({
                                    eventID: EventID.OpenAPIThemeChangeState,
                                    timestamp: new Date(),
                                    emitter: app.workspace,
                                    data: {
                                        mode: 'source',
                                    },
                                } as OpenAPIThemeChangeState);
                            }),
                ]}
            />

            <details>
                <summary>Extensions</summary>
                {Object.entries(plugin.settings.extensions).map(
                    ([id, extension]) => (
                        <OSetting
                            name={extension.name}
                            key={id}
                            noBorder
                            addToggles={[
                                (toggle) => {
                                    toggle.setValue(extension.on);
                                    toggle.onChange(async (value) => {
                                        plugin.settings.extensions[
                                            id as UserExtensions
                                        ].on = value;
                                        await plugin.settingsManager.saveSettings();
                                    });

                                    return toggle;
                                },
                            ]}
                        />
                    )
                )}
            </details>
        </>
    );
};

export default OpenAPIView;
