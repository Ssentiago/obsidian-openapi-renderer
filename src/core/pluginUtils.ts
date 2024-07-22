import {OpenAPIPluginContext} from "./contextManager";
import * as fs from 'fs/promises';
import path from "path";


export class PluginUtils {
    private appContext: OpenAPIPluginContext

    constructor(appContext: OpenAPIPluginContext) {
        this.appContext = appContext;
    }

    async isFirstOpenPlugin(): Promise<boolean> {
        debugger
        const pluginMetadata = await this.getPluginMetadata()

        const localStoragePluginMetadata = localStorage.getItem('openapi-renderer-metadata')
        if (localStoragePluginMetadata) {

            try {
                const localStoragePluginMetadataNumber = parseInt(localStoragePluginMetadata, 10)
                const isFirstOpen = !(pluginMetadata === localStoragePluginMetadataNumber)

                if (isFirstOpen) {
                    localStorage.setItem('openapi-renderer-metadata', pluginMetadata.toString())
                }
                return isFirstOpen

            } catch (err) {
            }
        }
        localStorage.setItem('openapi-renderer-metadata', pluginMetadata.toString())
        return true
    }

    async wasAnUpdate() {
        const storedPluginVersion = localStorage.getItem('openapi-renderer-version')

        if (storedPluginVersion) {
            const currentVersion = this.appContext.plugin.manifest.version
            return !(currentVersion === storedPluginVersion)
        } else {
            localStorage.setItem('openapi-renderer-version', this.appContext.plugin.manifest.version);
            return false
        }

    }

    async getPluginMetadata(): Promise<number> {
        const basePath = this.appContext.app.vault.adapter.basePath
        const pluginDir = this.appContext.plugin.manifest.dir
        if (pluginDir) {
            const pluginPath = path.join(basePath, pluginDir)
            const pluginDirStat = await fs.stat(pluginPath)
            const creationDate = pluginDirStat.birthtime
            return creationDate.getTime()
        }
        throw new Error('No plugin dir found.')
    }


}