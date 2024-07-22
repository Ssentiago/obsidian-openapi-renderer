import { MarkdownView, setIcon, TAbstractFile, TextComponent } from 'obsidian';
import {
    ChangeServerButtonStateEvent,
    OpenAPIRendererEventsHandlerInterface,
    ToggleButtonVisibilityEvent,
} from '../typing/interfaces';
import OpenAPIPluginContext from '../core/contextManager';
import { Button } from '../UI/Button';

import { eventPublisher } from '../typing/constants';

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
     * Modifies the OpenAPI specification file.
     * If the file path ends with the configured OpenAPI spec file name,
     * schedules an automatic update of the preview handler.
     * @param file - The abstract file object to modify.
     */
    async modifyOpenAPISPec(file: TAbstractFile): Promise<void> {
        if (
            file.path.endsWith(
                this.appContext.plugin.settings.openapiSpecFileName
            )
        ) {
            await this.appContext.plugin.previewHandler.scheduleAutoUpdate();
        }
    }

    /**
     * Handles blur event for input in settings tab related to OpenAPI spec file name.
     * Validates and updates the OpenAPI spec file name setting.
     * @param textComponent - The TextComponent for input handling.
     */
    async handleSettingsTabOpenAPISpecBlur(
        textComponent: TextComponent
    ): Promise<void> {
        const value = textComponent.getValue();
        if (value.match(/\.(yaml|yml|json)$/i)) {
            this.appContext.plugin.settings.openapiSpecFileName = value;
            await this.appContext.plugin.settingsManager.saveSettings();
        } else {
            const oldValue =
                this.appContext.plugin.settings.openapiSpecFileName;
            this.appContext.plugin.showNotice(
                `Invalid file extension.\nPlease use .yaml, .yml or .json.\n\nReverting to ${oldValue} after 2 seconds.`
            );
            setTimeout(() => {
                textComponent.setValue(oldValue);
                this.appContext.plugin.showNotice(`Reverted to ${oldValue}`);
            }, 2000);
        }
    }

    /**
     * Handles blur event for input in settings tab related to HTML file name.
     * Validates and updates the HTML file name setting.
     * @param textComponent - The TextComponent for input handling.
     */
    async handleSettingsTabHTMLFileNameBlur(
        textComponent: TextComponent
    ): Promise<void> {
        const value = textComponent.getValue();
        if (value.match(/\.html?$/)) {
            this.appContext.plugin.settings.htmlFileName = value;
            await this.appContext.plugin.settingsManager.saveSettings();
        } else {
            const oldValue = this.appContext.plugin.settings.htmlFileName;
            this.appContext.plugin.showNotice(
                `Invalid file extension.\nPlease use .html or .htm.\n\nReverting to ${oldValue} after 2 seconds.`
            );
            setTimeout(() => {
                textComponent.setValue(oldValue);
                this.appContext.plugin.showNotice(`Reverted to ${oldValue}`);
            }, 2000);
        }
    }

    /**
     * Handles blur event for input in settings tab related to iframe width.
     * Validates and updates the iframe width setting.
     * @param textComponent - The TextComponent for input handling.
     */
    async handleSettingsTabIframeWidthBlur(
        textComponent: TextComponent
    ): Promise<void> {
        const value = textComponent.getValue();
        if (value.match(/^\d+?(%|px)?$/)) {
            this.appContext.plugin.settings.iframeHeight = value;
            await this.appContext.plugin.settingsManager.saveSettings();
        } else {
            const oldValue = this.appContext.plugin.settings.iframeWidth;
            this.appContext.plugin.showNotice(
                `Invalid iframe width.\nPlease use a number followed by % or px (e.g. "100%", "500px"), or just a number for pixels.\n\nReverting to ${oldValue} after 2 seconds.`,
                5000
            );
            setTimeout(() => {
                textComponent.setValue(oldValue);
                this.appContext.plugin.showNotice(`Reverted to ${oldValue}`);
            }, 5000);
        }
    }

    /**
     * Handles blur event for input in settings tab related to iframe height.
     * Validates and updates the iframe height setting.
     * @param textComponent - The TextComponent for input handling.
     */
    async handleSettingsTabIframeHeightBlur(
        textComponent: TextComponent
    ): Promise<void> {
        const value = textComponent.getValue();
        if (value.match(/^\d+?(%|px)?$/)) {
            this.appContext.plugin.settings.iframeHeight = value;
            await this.appContext.plugin.settingsManager.saveSettings();
        } else {
            const oldValue = this.appContext.plugin.settings.iframeHeight;
            this.appContext.plugin.showNotice(
                `Invalid iframe width.\nPlease use a number followed by % or px (e.g. "100%", "500px"), or just a number for pixels.\n\nReverting to ${oldValue} after 2 seconds.`,
                5000
            );
            setTimeout(() => {
                textComponent.setValue(oldValue);
                this.appContext.plugin.showNotice(`Reverted to ${oldValue}`);
            }, 5000);
        }
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

    /**
     * Handles timeout input in a settings tab.
     * @param textComponent - The TextComponent for timeout input.
     */
    async handleSettingsTabTimeoutBlur(
        textComponent: TextComponent
    ): Promise<void> {
        const value = textComponent.getValue();
        const oldTimeout = this.appContext.plugin.settings.timeout;
        if (value.match(/^\d+$/)) {
            const timeout = parseInt(textComponent.inputEl.value, 10);
            textComponent.setValue(value.toString());
            this.appContext.plugin.settings.timeout = timeout;
            await this.appContext.plugin.settingsManager.saveSettings();
        } else {
            this.appContext.plugin.showNotice(
                `Incorrect timeout value. Input integer number. Reverting to ${oldTimeout} in 2 seconds`
            );
            setTimeout(() => {
                textComponent.setValue(oldTimeout.toString());
                this.appContext.plugin.showNotice(`Reverted to ${oldTimeout}`);
            }, 2000);
        }
    }

    /**
     * Creates a handler for changing the server button state.
     * @param button The Button instance.
     * @returns A function that handles ChangeServerButtonStateEvent.
     */
    handleServerButtonState(button: Button) {
        return async (event: ChangeServerButtonStateEvent): Promise<void> => {
            const elements = button.config.htmlElements?.values();
            if (elements) {
                for (const element of elements) {
                    setIcon(element, button.config.icon);
                }
            }
        };
    }

    /**
     * Creates a handler for toggling button visibility.
     * @param button The Button instance to handle visibility for.
     * @returns An async function that handles ToggleButtonVisibilityEvent.
     */
    handleButtonVisibility(button: Button) {
        return async (event: ToggleButtonVisibilityEvent): Promise<void> => {
            if (
                event.publisher === eventPublisher.Plugin ||
                event.data.buttonID === button.config.id
            ) {
                await button.buttonManager.toggleVisibility(button.config);
            }
        };
    }

    /**
     * Toggles the OpenAPI Renderer server based on its current state.
     * @param event The mouse event triggering the toggle action.
     */
    async handleServerButtonClick(event: MouseEvent): Promise<void> {
        const isRunning =
            this.appContext.plugin.uiManager.appContext.plugin.server.isRunning();
        const view =
            this.appContext.plugin.uiManager.appContext.app.workspace.getActiveViewOfType(
                MarkdownView
            );
        let msg = '';

        if (isRunning) {
            const isStopped = await this.appContext.plugin.server.stop();
            msg = isStopped
                ? `Server stopped.`
                : 'Cannot stop the server...\nTry again and check the logs for more info';
        } else {
            const isStarted = await this.appContext.plugin.server.start();
            msg = isStarted
                ? 'Server started'
                : 'Cannot start the server...\nTry again and check the logs for more info';
        }

        this.appContext.plugin.showNotice(msg);
        view && this.appContext.plugin.previewHandler.rerenderPreview(view);
    }
}
