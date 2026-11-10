import path from 'path';
import { BaseExtensionsStorage } from 'ui/views/OpenAPI/components/source/typing/interfaces';

import OpenAPIRendererPlugin from '../core/openapi-renderer-plugin';

export interface DefaultSettings {
    registerYamlJson: boolean;
    resourcesAutoUpdate: boolean;
    OpenAPIPreviewTheme: string;
    syncOpenAPIPreviewTheme: boolean;
    OpenAPISourceThemeMode: string;
    OpenAPISourceLightTheme: string;
    OpenAPISourceDarkTheme: string;
    syncOpenAPISourceTheme: boolean;
    OpenAPIViewDefaultMode: string;
    extensions: BaseExtensionsStorage;
}

export default class SettingsManager {
    plugin: OpenAPIRendererPlugin;

    constructor(plugin: OpenAPIRendererPlugin) {
        this.plugin = plugin;
    }

    /**
     * Gets the default settings.
     *
     * @returns The default settings.
     */
    get defaultSettings(): DefaultSettings {
        return {
            registerYamlJson: false,
            resourcesAutoUpdate: false,
            OpenAPIPreviewTheme: 'dark',
            OpenAPISourceThemeMode: 'dark',
            OpenAPISourceLightTheme: 'default',
            OpenAPISourceDarkTheme: 'default',
            syncOpenAPIPreviewTheme: true,
            syncOpenAPISourceTheme: true,
            OpenAPIViewDefaultMode: 'source',
            extensions:
                this.plugin.sourceExtensionsManager.pluginSettingsExtensions,
        };
    }

    /**
     * Normalizes the stored extension toggles against the extensions currently
     * known to the source extensions manager.
     *
     * Unknown ids from older data files are dropped, missing ids fall back to
     * their default state, and existing on/off values are preserved. This keeps
     * `settings.extensions` in sync with `extensionsStorage` so lookups in the
     * extension controller never hit an undefined entry.
     *
     * @param stored The extension storage loaded from the data file.
     * @returns A full extension storage matching the current extension set.
     */
    private normalizeExtensions(stored: unknown): BaseExtensionsStorage {
        const defaults =
            this.plugin.sourceExtensionsManager.pluginSettingsExtensions;
        const saved = (stored ?? {}) as Partial<BaseExtensionsStorage>;

        const result = {} as BaseExtensionsStorage;
        for (const id of Object.keys(
            defaults
        ) as (keyof BaseExtensionsStorage)[]) {
            const savedEntry = saved[id];
            result[id] = {
                name: defaults[id].name,
                on:
                    typeof savedEntry?.on === 'boolean'
                        ? savedEntry.on
                        : defaults[id].on,
            };
        }
        return result;
    }

    /**
     * Loads the plugin's settings from the plugin's data store.
     *
     * This method loads the plugin's settings from the plugin's data store, merges them with the default settings,
     * and assigns the resulting settings object to the plugin's `settings` property.
     *
     * @returns {Promise<void>} A promise that resolves when the settings have been loaded.
     */
    async loadSettings(): Promise<void> {
        const userSettings = (await this.plugin.loadData()) ?? {};
        const defaultSettings = this.defaultSettings;
        const settings = Object.assign({}, defaultSettings, userSettings);
        settings.extensions = this.normalizeExtensions(userSettings.extensions);
        this.plugin.settings = {
            ...settings,
        };
    }

    /**
     * Saves the plugin's settings to the plugin's data store.
     *
     * This method takes the plugin's settings and saves them to the plugin's data store.
     *
     * @returns {Promise<void>} A promise that resolves when the settings have been saved.
     */
    async saveSettings(): Promise<void> {
        await this.plugin.saveData(this.plugin.settings);
    }

    /**
     * Resets the plugin's settings to their default values.
     *
     * This method removes the plugin's configuration file from disk and then reloads the plugin's settings
     * from their default values.
     *
     * @returns {Promise<void>} A promise that resolves when the settings have been reset.
     */
    async resetSettings(): Promise<void> {
        const pluginDir = this.plugin.manifest.dir;
        if (!pluginDir) {
            throw new Error('No plugin dir found');
        }
        const configPath = path.join(pluginDir, '/data.json');
        const existsPath =
            await this.plugin.app.vault.adapter.exists(configPath);
        if (existsPath) {
            await this.plugin.app.vault.adapter.remove(configPath);
        }
        await this.loadSettings();
    }
}
