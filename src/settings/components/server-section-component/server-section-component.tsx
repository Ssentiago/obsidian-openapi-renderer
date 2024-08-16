import { App, Setting } from 'obsidian';
import OpenAPIRendererPlugin from '../../../core/OpenAPIRendererPlugin';
import { useSettingsContext } from '../core/context';
import React, { useEffect } from 'react';
import { SettingsContainer } from '../container-styled-component';

const ServerSectionComponent: React.FC<{
    app: App;
    plugin: OpenAPIRendererPlugin;
}> = ({ app, plugin }) => {
    const { ref } = useSettingsContext();

    useEffect(() => {
        if (ref.current) {
            const containerEl = ref.current as HTMLElement;

            new Setting(containerEl)
                .setName('Server status')
                .setDesc(
                    'Check the current status of the server and start or stop it as needed.'
                )
                .addButton((button) => {
                    let timeout: NodeJS.Timeout | null = null;

                    const updateButtonState: () => void = () => {
                        if (plugin.server.isRunning()) {
                            button
                                .setIcon('check-circle')
                                .setTooltip('Server is running');
                        } else {
                            button
                                .setIcon('x-circle')
                                .setTooltip('Server is not running');
                        }
                    };

                    updateButtonState();

                    button.onClick(async () => {
                        if (timeout) {
                            if (plugin.server.isRunning()) {
                                plugin.showNotice('Stopping the server...');
                                const isServerStopped =
                                    await plugin.server.stop();
                                if (isServerStopped) {
                                    plugin.showNotice(
                                        'Server stopped successfully!'
                                    );
                                } else {
                                    plugin.showNotice(
                                        'Failed to stop server. Check logs for details.'
                                    );
                                }
                                updateButtonState();
                            }
                        } else {
                            if (plugin.server.isRunning()) {
                                plugin.showNotice(
                                    'Pong! Server is running. Click again if you want to stop it',
                                    3000
                                );
                                timeout = setTimeout(async () => {
                                    timeout = null;
                                }, 3000);
                            } else {
                                const startServer = await plugin.server.start();
                                if (startServer) {
                                    plugin.showNotice(
                                        'Server started successfully!'
                                    );
                                } else {
                                    plugin.showNotice(
                                        'Failed to start server. Check logs for details.'
                                    );
                                }
                            }
                            updateButtonState();
                        }
                    });
                });
            new Setting(containerEl)
                .setName('Autostart server')
                .setDesc(
                    'Enable or disable automatic server startup when the plugin is activated.'
                )
                .addToggle((toggle) =>
                    toggle
                        .setValue(plugin.settings.isServerAutoStart)
                        .onChange(async (value) => {
                            plugin.settings.isServerAutoStart = value;
                            await plugin.settingsManager.saveSettings();
                        })
                );

            new Setting(containerEl)
                .setName('Server listening port')
                .setDesc(
                    'Specify the port number that the OpenAPI Renderer server will use to listen for incoming connections. ' +
                        'Valid port numbers range from 1024 to 65535.'
                )
                .addText((text) => {
                    text.setPlaceholder('8080').setValue(
                        plugin.settings.serverPort.toString()
                    );

                    const handler =
                        plugin.eventsHandler.handleSettingsTabServerPortBlur.bind(
                            plugin.eventsHandler,
                            text
                        );
                    plugin.registerDomEvent(text.inputEl, 'blur', handler);
                    text.inputEl.id = 'openapi-input-port';
                });
        }
    });

    return (
        <SettingsContainer className={'openapi-renderer-settings'} ref={ref} />
    );
};

export default ServerSectionComponent;
