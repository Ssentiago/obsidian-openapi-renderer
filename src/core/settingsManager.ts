import OpenAPIRendererPlugin from './OpenAPIRendererPlugin';
import path from 'path';
import { eventID, eventPublisher, Subject } from '../typing/constants';
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
     * Retrieves the default settings for the plugin.
     *
     * This method provides the default configuration values for various plugin settings, including file names,
     * dimensions, server configuration, button locations, timeout settings, export type, and resource update options.
     *
     * @returns {DEFAULT_SETTINGS_Interface} The default settings object.
     */
    get defaultSettings(): DEFAULT_SETTINGS_Interface {
        return {
            serverHostName: '127.0.0.1',
            serverPort: 8080,
            isServerAutoStart: false,
            exportType: 'none',
            isResourcesAutoUpdate: false,
            OpenAPIPreviewTheme: 'dark',
            OpenAPISourceThemeMode: 'dark',
            OpenAPISourceLightTheme: 'default',
            OpenAPISourceDarkTheme: 'default',
            synchronizeOpenAPIPreviewTheme: true,
            synchronizeOpenAPISourceTheme: true,
        };
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
            const existsPath =
                await this.plugin.app.vault.adapter.exists(configPath);
            if (existsPath) {
                await this.plugin.app.vault.adapter.remove(configPath);
            }
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
}
