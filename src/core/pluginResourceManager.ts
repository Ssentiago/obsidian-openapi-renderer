import { App } from 'obsidian';
import OpenAPIRendererPlugin from './OpenAPIRendererPlugin';
import path from 'path';

export default class PluginResourceManager {
    private app: App;
    private plugin: OpenAPIRendererPlugin;
    resourceCache: Map<string, string> = new Map();
    assetsPath!: string;

    constructor(app: App, plugin: OpenAPIRendererPlugin) {
        this.app = app;
        this.plugin = plugin;

        this.initializeAssetsPath().catch((err: any) => {
            this.plugin.showNotice(err.message);
            throw err;
        });
    }

    async initializeAssetsPath() {
        const pluginDir = this.plugin.manifest.dir;
        if (!pluginDir) {
            throw new Error('No plugin directory found');
        }

        this.assetsPath = path.join(pluginDir, 'assets/swagger-ui');
    }

    private async getResource(resourcePath: string): Promise<string> {
        const cachedResource = this.resourceCache.get(resourcePath);
        if (cachedResource) {
            return cachedResource;
        }

        try {
            const resource = await this.app.vault.adapter.read(resourcePath);
            this.resourceCache.set(resourcePath, resource);
            if (resourcePath.endsWith('swagger-ui-bundle.js')) {
                debugger;
            }
            return resource;
        } catch (err: any) {
            this.plugin.logger.error(
                'Error while reading file in view:',
                err.message
            );
            throw new Error(
                'Error while reading a resource file. Try re-download it'
            );
        }
    }

    async getCSS(cssName: string): Promise<string> {
        const cssPath = path.join(this.assetsPath, cssName);
        return this.getResource(cssPath);
    }

    async getJS(jsName: string): Promise<string> {
        const jsPath = path.join(this.assetsPath, jsName);
        return this.getResource(jsPath);
    }
}
