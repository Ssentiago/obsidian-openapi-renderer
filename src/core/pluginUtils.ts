import OpenAPIPluginContext from './contextManager';
import * as fs from 'fs/promises';
import path from 'path';

/**
 * Provides utility functions for managing plugin state and metadata.
 *
 * This class offers methods to determine if the plugin is opened for the first time, check for updates,
 * and retrieve metadata based on the plugin directory's creation time.
 */
export default class PluginUtils {
    private appContext: OpenAPIPluginContext;

    constructor(appContext: OpenAPIPluginContext) {
        this.appContext = appContext;
    }

    /**
     * Determines if the plugin is being opened for the first time.
     *
     * Compares current plugin metadata with stored metadata in local storage. Updates local storage if it's the first launch.
     *
     * @returns `true` if it's the first time the plugin is opened, otherwise `false`.
     */
    async isFirstOpenPlugin(): Promise<boolean> {
        const pluginMetadata = await this.getPluginMetadata();

        const localStoragePluginMetadata = localStorage.getItem(
            'openapi-renderer-metadata'
        );

        if (!localStoragePluginMetadata) {
            localStorage.setItem(
                'openapi-renderer-metadata',
                pluginMetadata.toString()
            );
            return true;
        }
        const localStoragePluginMetadataNumber = parseInt(
            localStoragePluginMetadata,
            10
        );

        if (
            isNaN(localStoragePluginMetadataNumber) ||
            pluginMetadata !== localStoragePluginMetadataNumber
        ) {
            localStorage.setItem(
                'openapi-renderer-metadata',
                pluginMetadata.toString()
            );
            return true;
        }
        return false;
    }

    /**
     * Checks if the plugin has been updated since the last recorded version.
     *
     * Compares the current plugin version with the stored version in local storage. Updates the stored version if it has changed.
     *
     * @returns `true` if the plugin version has been updated, otherwise `false`.
     */
    async wasAnUpdate(): Promise<boolean> {
        const storedPluginVersion = localStorage.getItem(
            'openapi-renderer-version'
        );
        const currentVersion = this.appContext.plugin.manifest.version;
        if (
            storedPluginVersion === null ||
            storedPluginVersion !== currentVersion
        ) {
            localStorage.setItem(
                'openapi-renderer-version',
                this.appContext.plugin.manifest.version
            );
            return true;
        }
        return false;
    }

    /**
     * Retrieves metadata for the plugin based on its directory creation time.
     *
     * Constructs the path to the plugin directory, retrieves its stats, and returns the directory's creation time in milliseconds.
     *
     * @returns {Promise<number>} A promise that resolves to the plugin directory's creation time in milliseconds.
     * @throws {Error} Throws an error if the plugin directory is not found.
     */
    async getPluginMetadata(): Promise<number> {
        const { basePath } = this.appContext.app.vault.adapter;
        const { dir: pluginDir } = this.appContext.plugin.manifest;

        if (!pluginDir) {
            throw new Error('No plugin dir found.');
        }

        const pluginPath = path.join(basePath, pluginDir);
        const pluginDirStat = await fs.stat(pluginPath);
        return pluginDirStat.birthtime.getTime();
    }
}
