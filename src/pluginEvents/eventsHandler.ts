import { TextComponent } from 'obsidian';
import { OpenAPIRendererEventsHandlerInterface } from '../typing/interfaces';
import OpenAPIPluginContext from '../core/contextManager';

/**
 * Handler for managing events and settings related to OpenAPI rendering.
 *
 * This class implements event handling and validation functions for managing settings related to OpenAPI rendering.
 * It interacts with the Obsidian plugin context to modify settings and handle user input.
 */
export class OpenAPIRendererEventsHandler
    implements OpenAPIRendererEventsHandlerInterface
{
    appContext: OpenAPIPluginContext;

    constructor(appContext: OpenAPIPluginContext) {
        this.appContext = appContext;
    }

    /**
     * Handles blur event for input in settings tab related to server port.
     * Validates and updates the server port setting.
     * @param textComponent - The TextComponent for input handling.
     */
    async handleSettingsTabServerPortBlur(
        textComponent: TextComponent
    ): Promise<void> {
        const value = textComponent.getValue();
        const oldPort = this.appContext.plugin.settings.serverPort;
        if (!value.match(/^\d+$/)) {
            this.appContext.plugin.showNotice(
                `Incorrect port value. Reverting to ${oldPort} in 2 seconds`
            );
            setTimeout(() => {
                textComponent.setValue(oldPort.toString());
                this.appContext.plugin.showNotice(`Reverted to ${oldPort}`);
            }, 2000);
        } else {
            const port = parseInt(value, 10);
            if (oldPort === port) {
                return;
            }

            if (port > 1024 && port < 65536) {
                if (await this.appContext.plugin.server.isPortAvailable(port)) {
                    this.appContext.plugin.settings.serverPort = port;
                    textComponent.setValue(port.toString());
                    await this.appContext.plugin.settingsManager.saveSettings();

                    if (
                        this.appContext.plugin.server.server &&
                        this.appContext.plugin.server.isRunning()
                    ) {
                        await this.appContext.plugin.server
                            .reload()
                            .then((isReloaded) => {
                                if (isReloaded) {
                                    this.appContext.plugin.showNotice(
                                        `The server was reloaded on the port: ${port}`
                                    );
                                } else {
                                    this.appContext.plugin.showNotice(
                                        'Something was happened... Try again. Check the log file for more info'
                                    );
                                }
                            });
                    }
                } else {
                    this.appContext.plugin.showNotice(
                        `This port was occupied. Reverting to ${oldPort} in 2 seconds`
                    );
                    setTimeout(() => {
                        textComponent.setValue(oldPort.toString());
                        this.appContext.plugin.showNotice(
                            `Reverted to ${oldPort}`
                        );
                    }, 2000);
                }
            } else {
                this.appContext.plugin.showNotice(
                    `Incorrect port value. Returning to ${oldPort} in 2 seconds`
                );
                setTimeout(() => {
                    textComponent.setValue(oldPort.toString());
                    this.appContext.plugin.showNotice(`Reverted to ${oldPort}`);
                }, 2000);
            }
        }
    }
}
