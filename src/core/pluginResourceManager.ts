import { App } from 'obsidian';
import OpenAPIRendererPlugin from './OpenAPIRendererPlugin';
import path from 'path';
import { SwaggerUIBundle } from '../view/typing/swagger-ui-typings';

export default class PluginResourceManager {
    private app: App;
    private plugin: OpenAPIRendererPlugin;
    resourceCache: Map<string, string> = new Map();
    assetsPath!: string;
    public swaggerUIBundle: SwaggerUIBundle | null = null;

    constructor(app: App, plugin: OpenAPIRendererPlugin) {
        this.app = app;
        this.plugin = plugin;

        this.initializeAssetsPath().catch((err: any) => {
            this.plugin.showNotice(err.message);
            throw err;
        });
    }

    async initializeAssetsPath(): Promise<void> {
        const pluginDir = this.plugin.manifest.dir;
        if (!pluginDir) {
            throw new Error('No plugin directory found');
        }

        this.assetsPath = path.join(pluginDir, 'assets');
    }

    private async getResource(resourcePath: string): Promise<string> {
        const cachedResource = this.resourceCache.get(resourcePath);
        if (cachedResource) {
            return cachedResource;
        }

        try {
            const resource = await this.app.vault.adapter.read(resourcePath);
            this.resourceCache.set(resourcePath, resource);
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
        const cssPath = path.join(this.assetsPath, 'swagger-ui', cssName);
        return this.getResource(cssPath);
    }

    async getjsondiffpatchDiffCSS(): Promise<string> {
        const diffCSSPath = path.join(
            this.assetsPath,
            'jsondiffpatch/jsondiffpatch-visual-diff.css'
        );
        return this.getResource(diffCSSPath);
    }

    async initSwaggerUIBundle(): Promise<void> {
        if (this.swaggerUIBundle) {
            return;
        }
        const pluginDir = this.plugin.manifest.dir;
        if (!pluginDir) {
            throw new Error('No plugin dir found');
        }

        const assetsPath = path.join(
            pluginDir,
            'assets',
            'swagger-ui',
            'swagger-ui-bundle.js'
        );

        try {
            const swaggerContent =
                await this.plugin.app.vault.adapter.read(assetsPath);
            this.swaggerUIBundle = new Function(
                `${swaggerContent}
                    return SwaggerUIBundle;`
            )();
        } catch (error: any) {
            this.plugin.logger.error(
                'Error initializing SwaggerUIBundle:',
                error.message
            );
            this.plugin.showNotice(
                'Failed to initialize SwaggerUI. Please check the logs for details.'
            );
        }
    }
}
