import OpenAPIRendererPlugin from '../core/OpenAPIRendererPlugin';
import { OpenAPIRendererEventPublisher } from '../pluginEvents/eventManager';
import { App, Setting } from 'obsidian';
import { SettingSectionParams, SettingsSection } from '../typing/interfaces';

/**
 * Represents the server settings section within the OpenAPI Renderer plugin settings.
 * Allows users to configure server-related options such as status checking, autostart, and port settings.
 */
export default class ServerSettings implements SettingsSection {
    app: App;
    plugin: OpenAPIRendererPlugin;
    publisher: OpenAPIRendererEventPublisher;

    constructor(
        { app, plugin, publisher }: SettingSectionParams,
        private position: number
    ) {
        this.app = app;
        this.plugin = plugin;
        this.publisher = publisher;
    }

    /**
     * Displays server-related settings in the given container element.
     *
     * @param containerEl - The HTML element where the settings will be displayed.
     */
    display(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName('Server status')
            .setDesc(
                'Check the current status of the server and start or stop it as needed.'
            )
            .addButton((button) => {
                let timeout: NodeJS.Timeout | null = null;

                const updateButtonState: () => void = () => {
                    if (this.plugin.server.isRunning()) {
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
                        if (this.plugin.server.isRunning()) {
                            this.plugin.showNotice('Stopping the server...');
                            const isServerStopped =
                                await this.plugin.server.stop();
                            if (isServerStopped) {
                                this.plugin.showNotice(
                                    'Server stopped successfully!'
                                );
                            } else {
                                this.plugin.showNotice(
                                    'Failed to stop server. Check logs for details.'
                                );
                            }
                            updateButtonState();
                        }
                    } else {
                        if (this.plugin.server.isRunning()) {
                            this.plugin.showNotice(
                                'Pong! Server is running. Click again if you want to stop it',
                                3000
                            );
                            timeout = setTimeout(async () => {
                                timeout = null;
                            }, 3000);
                        } else {
                            const startServer =
                                await this.plugin.server.start();
                            if (startServer) {
                                this.plugin.showNotice(
                                    'Server started successfully!'
                                );
                            } else {
                                this.plugin.showNotice(
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
                    .setValue(this.plugin.settings.isServerAutoStart)
                    .onChange(async (value) => {
                        this.plugin.settings.isServerAutoStart = value;
                        await this.plugin.settingsManager.saveSettings();
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
                    this.plugin.settings.serverPort.toString()
                );

                const handler =
                    this.plugin.eventsHandler.handleSettingsTabServerPortBlur.bind(
                        this.plugin.eventsHandler,
                        text
                    );
                this.plugin.registerDomEvent(text.inputEl, 'blur', handler);
                text.inputEl.id = 'openapi-input-port';
            });
    }
}
