import OpenAPIRendererPlugin from './OpenAPIRendererPlugin';
import path from 'path';
import {
    ButtonLocation,
    eventID,
    eventPublisher,
    Subject,
} from '../typing/constants';
import {
    DEFAULT_SETTINGS_Interface,
    ToggleButtonVisibilityEvent,
} from '../typing/interfaces';

export default class SettingsManager {
    plugin: OpenAPIRendererPlugin;

    constructor(plugin: OpenAPIRendererPlugin) {
        this.plugin = plugin;
    }

    /**
     * Loads and initializes the plugin settings.
     *
     * This method retrieves user settings from the plugin's data store and merges them with default settings.
     * It then updates the plugin's settings property, converting specific properties to `Set` objects.
     *
     * @returns {Promise<void>} A promise that resolves when settings have been successfully loaded and applied.
     */

    async loadSettings(): Promise<void> {
        const userSettings = await this.plugin.loadData();
        const defaultSettings = this.defaultSettings;
        const settings = Object.assign({}, defaultSettings, userSettings);
        this.plugin.settings = {
            ...settings,
            renderButtonLocation: new Set(settings.renderButtonLocation),
            refreshButtonLocation: new Set(settings.refreshButtonLocation),
            serverButtonLocations: new Set(settings.serverButtonLocations),
        };
    }

    /**
     * Saves the current plugin settings.
     *
     * This method converts specific `Set` properties of the plugin's settings into arrays,
     * and then saves the entire settings object to the plugin's data store.
     *
     * @returns {Promise<void>} A promise that resolves when the settings have been successfully saved.
     */
    async saveSettings(): Promise<void> {
        const saveData = {
            ...this.plugin.settings,
            renderButtonLocation: Array.from(
                this.plugin.settings.renderButtonLocation
            ),
            refreshButtonLocation: Array.from(
                this.plugin.settings.refreshButtonLocation
            ),
            serverButtonLocations: Array.from(
                this.plugin.settings.serverButtonLocations
            ),
        };
        await this.plugin.saveData(saveData);
    }

    /**
     * Resets the plugin settings to their default state.
     *
     * This method removes the plugin's configuration file from the vault, reloads the default settings,
     * and publishes a `ToggleButtonVisibilityEvent` to update the UI.
     *
     * @returns {Promise<void>} A promise that resolves when the settings have been reset and the event has been published.
     */
    async resetSettings(): Promise<void> {
        const pluginPath = this.plugin.manifest.dir;
        if (pluginPath) {
            const configPath = path.join(pluginPath, '/data.json');
            await this.plugin.app.vault.adapter.remove(configPath);
            await this.loadSettings();
            const event = {
                eventID: eventID.ToggleButtonVisibility,
                timestamp: new Date(),
                publisher: eventPublisher.App,
                subject: Subject.All,
                emitter: this.plugin.app.workspace,
                data: {
                    buttonID: null,
                },
            } as ToggleButtonVisibilityEvent;
            this.plugin.publisher.publish(event);
        }
    }

    /**
     * Retrieves the default settings for the plugin.
     *
     * This method provides the default configuration values for various plugin settings, including file names,
     * dimensions, server configuration, button locations, timeout settings, export type, and resource update options.
     *
     * @returns {DEFAULT_SETTINGS_Interface} The default settings object.
     */
    get defaultSettings(): DEFAULT_SETTINGS_Interface {
        return {
            htmlFileName: 'openapi-spec.html',
            openapiSpecFileName: 'openapi-spec.yaml',
            iframeWidth: '100%',
            iframeHeight: '600px',
            isHTMLAutoUpdate: false,
            serverHostName: '127.0.0.1',
            serverPort: 8080,
            proxyHostName: '127.0.0.1',
            proxyPort: 47899,
            isServerAutoStart: false,
            isCreateServerButton: true,
            isCreateCommandButtons: false,
            renderButtonLocation: new Set([ButtonLocation.Toolbar]),
            refreshButtonLocation: new Set([ButtonLocation.Toolbar]),
            serverButtonLocations: new Set([ButtonLocation.Ribbon]),
            timeoutUnit: 'milliseconds',
            timeout: 2000,
            exportType: 'none',
            isResourcesAutoUpdate: false,
        };
    }
}
