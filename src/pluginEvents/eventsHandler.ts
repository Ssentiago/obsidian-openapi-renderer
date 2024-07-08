import {TAbstractFile, TextComponent} from "obsidian";
import {OpenAPIRendererEventsHandlerInterface} from "../typing/interfaces";
import {OpenAPIPluginContext} from "../contextManager";

/**
 * Handler for managing events and settings related to OpenAPI rendering.
 *
 * This class implements event handling and validation functions for managing settings related to OpenAPI rendering.
 * It interacts with the Obsidian plugin context to modify settings and handle user input.
 */
export class OpenAPIRendererEventsHandler implements OpenAPIRendererEventsHandlerInterface {
    appContext: OpenAPIPluginContext

    constructor(appContext: OpenAPIPluginContext) {
        this.appContext = appContext;
    }

    /**
     * Track file modifications and verify for the current OpenAPI spec.
     *
     * This function checks if the provided file path ends with the specified OpenAPI spec file name.
     * If it does, it schedules an auto-update for the preview handler.
     *
     * @param file - The file object representing the OpenAPI spec file.
     * @returns A promise that resolves when the function completes.
     */
    async modifyOpenAPISPec(file: TAbstractFile) {
        if (file.path.endsWith(this.appContext.plugin.settings.openapiSpecFileName)) {
            await this.appContext.plugin.previewHandler.scheduleAutoUpdate();
        }
    };

    /**
     * Updates the plugin settings with the provided HTML filename.
     *
     * This function validates whether the value entered in the text component for the HTML filename ends with one of the allowed extensions:
     * .html or .htm. If the filename does not have one of these extensions, it is considered invalid.
     *
     * @param textComponent - Object containing information about the input element.
     * @returns A promise that resolves when the function completes.
     */
    async settingsTabInputIframeBlur(textComponent: TextComponent) {
        const value = textComponent.getValue()
        if (value.match(/\.(yaml|yml|json)$/i)) {
            this.appContext.plugin.settings.openapiSpecFileName = value;
            await this.appContext.plugin.saveSettings();
        } else {
            const oldValue = this.appContext.plugin.settings.openapiSpecFileName;
            this.appContext.plugin.showNotice(`Invalid file extension.\nPlease use .yaml, .yml or .json.\n\nReverting to ${oldValue} after 2 seconds.`);
            setTimeout(() => {
                textComponent.setValue(oldValue);
                this.appContext.plugin.showNotice(`Reverted to ${oldValue}`);
            }, 2000);
        }
    };

    /**
     * Checks if the HTML filename is valid.
     *
     * This function validates whether the value entered in the text component for the HTML filename ends with one of the allowed extensions:
     * .html or .htm. If the filename does not have one of these extensions, it is considered invalid.
     *
     * @param textComponent - Object containing information about the input element.
     * @returns A promise that resolves when the function completes.
     */

    async settingsTabInputHtmlBlur(textComponent: TextComponent) {
        const value = textComponent.getValue()
        if (value.match(/\.html?$/)) {
            this.appContext.plugin.settings.htmlFileName = value;
            await this.appContext.plugin.saveSettings();
        } else {
            const oldValue = this.appContext.plugin.settings.htmlFileName;
            this.appContext.plugin.showNotice(`Invalid file extension.\nPlease use .html or .htm.\n\nReverting to ${oldValue} after 2 seconds.`);
            setTimeout(() => {
                textComponent.setValue(oldValue);
                this.appContext.plugin.showNotice(`Reverted to ${oldValue}`);
            }, 2000);
        }
    };

    /**
     * Checks if the iframe width value is valid.
     *
     * This function validates whether the value entered in the text component for iframe width is in a correct format.
     * It allows values that are either a number followed by '%' or 'px', or just a number. Other formats are considered
     * incorrect. If a valid width value is entered, it updates the plugin settings, saves them, and attempts to reload
     * the server on the new port if it is currently running.
     *
     * @param textComponent - Object containing information about the input element.
     * @returns A promise that resolves when the function completes.
     */
    async settingsTabInputIframeWidthBlur(textComponent: TextComponent) {
        const value = textComponent.getValue()
        if (value.match(/^\d+?(%|px)?$/)) {
            this.appContext.plugin.settings.iframeHeight = value;
            await this.appContext.plugin.saveSettings();
        } else {
            const oldValue = this.appContext.plugin.settings.iframeWidth;
            this.appContext.plugin.showNotice(`Invalid iframe width.\nPlease use a number followed by % or px (e.g. "100%", "500px"), or just a number for pixels.\n\nReverting to ${oldValue} after 2 seconds.`, 5000);
            setTimeout(() => {
                textComponent.setValue(oldValue);
                this.appContext.plugin.showNotice(`Reverted to ${oldValue}`);
            }, 5000);
        }
    };

    /**
     * Checks if the iframe height value is valid.
     *
     * This function validates whether the value entered in the text component for iframe height is in a correct format.
     * It allows values that are either a number followed by '%' or 'px', or just a number. Other formats are considered
     * incorrect. If a valid height value is entered, it updates the plugin settings, saves them, and attempts to reload
     * the server on the new port if it is currently running.
     *
     * @param textComponent - Object containing information about the input element.
     * @returns A promise that resolves when the function completes.
     */
    async settingsTabInputIframeHeightBlur(textComponent: TextComponent) {
        const value = textComponent.getValue()
        if (value.match(/^\d+?(%|px)?$/)) {
            this.appContext.plugin.settings.iframeHeight = value;
            await this.appContext.plugin.saveSettings();
        } else {
            const oldValue = this.appContext.plugin.settings.iframeHeight;
            this.appContext.plugin.showNotice(`Invalid iframe width.\nPlease use a number followed by % or px (e.g. "100%", "500px"), or just a number for pixels.\n\nReverting to ${oldValue} after 2 seconds.`, 5000);
            setTimeout(() => {
                textComponent.setValue(oldValue);
                this.appContext.plugin.showNotice(`Reverted to ${oldValue}`);
            }, 5000);
        }
    }

    /**
     * Handles the blur event for the server port input in the settings tab.
     *
     * This method checks the validity of the entered server port value. If the value is invalid or the port is already in use,
     * it reverts to the previous valid port value after displaying a notification. If a valid and available port is entered,
     * it updates the plugin settings, saves them, and attempts to reload the server on the new port if it is currently running.
     *
     * @param textComponent - Obsidian object containing information about the input element.
     */
    async settingsTabServerPortBlur(textComponent: TextComponent) {
        const value = textComponent.getValue()
        const oldPort = this.appContext.plugin.settings.serverPort;
        if (!value.match(/^\d+$/)) {
            this.appContext.plugin.showNotice(`Incorrect port value. Reverting to ${oldPort} in 2 seconds`)
            setTimeout(() => {
                textComponent.setValue(oldPort.toString())
                this.appContext.plugin.showNotice(`Reverted to ${oldPort}`)
            }, 2000)
        } else {
            const port = parseInt(value, 10)
            if (oldPort === port) return;


            if (port > 1024 && port < 65536) {
                if (await this.appContext.plugin.server.isPortAvailable(port)) {
                    this.appContext.plugin.settings.serverPort = port;
                    textComponent.setValue(port.toString())
                    await this.appContext.plugin.saveSettings();

                    if (this.appContext.plugin.server && this.appContext.plugin.server.isRunning()) {
                        this.appContext.plugin.server.reload().then((isReloaded) => {
                            if (isReloaded) {
                                this.appContext.plugin.showNotice(`The server was reloaded on the port: ${port}`);
                            } else {
                                this.appContext.plugin.showNotice('Something was happened... Try again. Check the log file for more info')
                            }
                        })
                    }
                    ;
                } else {
                    this.appContext.plugin.showNotice(`This port was occupied. Returning to ${oldPort} in 2 seconds`)
                    setTimeout(() => {
                        textComponent.setValue(oldPort.toString())
                        this.appContext.plugin.showNotice('Reverted to ${oldPort}')
                    }, 2000)
                }
            } else {
                this.appContext.plugin.showNotice(`Incorrect port value. Returning to ${oldPort} in 2 seconds`)
                setTimeout(() => {
                    textComponent.setValue(oldPort.toString())
                    this.appContext.plugin.showNotice(`Reverted to ${oldPort}`)
                }, 2000)
            }
        }

    }

    async settingsTabTimeoutInput(textComponent: TextComponent) {
        const value = textComponent.getValue()
        const oldTimeout = this.appContext.plugin.settings.timeout
        if (value.match(/^\d+$/)) {
            const timeout = parseInt(textComponent.inputEl.value, 10)
            textComponent.setValue(value.toString())
            this.appContext.plugin.settings.timeout = timeout
            await this.appContext.plugin.saveSettings();
        } else {
            this.appContext.plugin.showNotice(`Incorrect timeout value. Input integer number. Reverting to ${oldTimeout} in 2 seconds`)
            setTimeout(() => {
                textComponent.setValue(oldTimeout.toString())
                this.appContext.plugin.showNotice(`Reverted to ${oldTimeout}`)
            }, 2000)
        }
    }
}
