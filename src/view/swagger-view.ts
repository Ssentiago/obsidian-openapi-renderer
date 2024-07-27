// import {SwaggerConfigs, SwaggerUIBundle} from 'swagger-ui-dist';
import { App, ItemView, setIcon, TFile, WorkspaceLeaf } from 'obsidian';
import path from 'path';
import OpenAPIRendererPlugin from '../core/OpenAPIRendererPlugin';
import { promises as fs } from 'fs';
import { CSS_NAME, SwaggerUITheme } from '../typing/constants';
import { SwaggerUIBundle } from '../typing/swagger-ui-typings';

const SWAGGER_VIEW_TYPE = 'swagger-view';

export default class SwaggerView extends ItemView {
    plugin: OpenAPIRendererPlugin;
    private cssCache = new Map<string, string>();
    currentDir: string = '/';
    renderTimeout: NodeJS.Timeout | null = null;
    swaggerContent: any = null;
    private swaggerUIBundle: SwaggerUIBundle | null = null;
    currentTheme: SwaggerUITheme;

    constructor(leaf: WorkspaceLeaf, plugin: OpenAPIRendererPlugin) {
        super(leaf);
        this.plugin = plugin;

        this.currentTheme = this.plugin.settings.swaggerUITheme;

        this.app.workspace.on('file-open', async (file: TFile | null) => {
            if (file) {
                const currentDir = file.parent?.path;
                if (currentDir) {
                    const oldCurDir = this.currentDir;
                    this.currentDir = currentDir;
                    if (currentDir !== oldCurDir) {
                        await this.debounceRender();
                    }
                }
            }
        });
    }

    private async initSwaggerUIBundle() {
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
                await this.app.vault.adapter.read(assetsPath);
            this.swaggerUIBundle = new Function(
                `${swaggerContent}
                return SwaggerUIBundle;`
            )();
        } catch (error) {
            console.error('Error initializing SwaggerUIBundle:', error);
            this.plugin.showNotice(
                'Failed to initialize SwaggerUI. Please check the console for details.'
            );
        }
    }

    getViewType(): string {
        return SWAGGER_VIEW_TYPE;
    }

    getDisplayText(): string {
        return 'Swagger View';
    }

    static async activateView(app: App) {
        const { workspace } = app;
        let leaf = workspace.getLeavesOfType('swagger-view')[0];
        if (!leaf) {
            // @ts-ignore
            leaf = workspace.getRightLeaf(false);
            await leaf.setViewState({ type: 'swagger-view' });
        }
        workspace.revealLeaf(leaf);
    }

    async onOpen() {
        await this.renderView();
    }

    async onClose() {}

    async debounceRender() {
        if (this.renderTimeout) {
            clearTimeout(this.renderTimeout);
        }

        await this.showLoadingView();

        this.renderTimeout = setTimeout(async () => {
            await this.renderView();
            this.renderTimeout = null;
        }, 2000);
    }

    async showLoadingView() {
        const { contentEl } = this;
        contentEl.empty();

        const loadingText = contentEl.createEl('div', {
            cls: 'loading-text',
            text: 'Loading ',
        });

        const spinner = loadingText.createSpan({ cls: 'spinner' });
        setIcon(spinner, 'loader');

        const style = contentEl.createEl('style');
        style.textContent = `.loading-text {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2em;
                color: var(--text-normal);
            }
            .spinner {
                display: inline-flex;
                width: 1em;
                height: 1em;
                margin-left: 0.5em;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                100% { transform: rotate(360deg); }
            }`;
    }

    async renderView() {
        const mainEl = this.containerEl.children[1];
        mainEl.empty();

        const swaggerHeader = mainEl.createEl('div');
        const swaggerBody = mainEl.createEl('div');

        swaggerHeader.empty();
        swaggerBody.empty();

        await this.renderHeader(swaggerHeader);

        await this.renderSwaggerUI(swaggerBody);
    }

    async renderHeader(swaggerHeader: Element) {
        const buttonContainer = swaggerHeader.createEl('div', {
            cls: 'swagger-header-actions',
        });
        const refreshButton = buttonContainer.createEl('button', {
            title: 'Refresh view',
        });

        refreshButton.addClasses(['clickable-icon', 'side-dock-ribbon-action']);
        setIcon(refreshButton, 'refresh-cw');
        this.plugin.registerDomEvent(refreshButton, 'click', async () => {
            await this.renderView();
        });

        const themeButton = buttonContainer.createEl('button', {
            title: 'Theme',
        });
        themeButton.addClasses(['clickable-icon', 'side-dock-ribbon-action']);
        const theme = this.currentTheme;
        let themeIcon = theme === 'light' ? 'sun' : 'moon';
        setIcon(themeButton, themeIcon);
        this.plugin.registerDomEvent(themeButton, 'click', async () => {
            themeIcon = themeIcon === 'sun' ? 'moon' : 'sun';
            setIcon(themeButton, themeIcon);
            this.currentTheme =
                themeIcon === 'sun'
                    ? SwaggerUITheme.light
                    : SwaggerUITheme.dark;
            await this.renderView();
        });
    }

    async renderSwaggerUI(swaggerBody: Element) {
        if (!this.swaggerUIBundle) {
            await this.initSwaggerUIBundle();
        }

        const baseContainer = swaggerBody.createEl('div');
        const swaggerContainer = baseContainer.createEl('div');
        const theme = this.currentTheme;
        const additionalCSSName =
            theme === 'light' ? CSS_NAME.LightThemeCSS : CSS_NAME.DarkThemeCSS;

        let baseCSS: string, additionalCSS: string;
        try {
            baseCSS = await this.getCSS(CSS_NAME.BaseCSS);
            additionalCSS = await this.getCSS(additionalCSSName);
        } catch (err: any) {
            this.plugin.showNotice(err.message);
            return;
        }

        const style = baseContainer.createEl('style');
        style.textContent = baseCSS + additionalCSS;

        let parsedSpec: object;
        try {
            const specFileName = this.plugin.settings.openapiSpecFileName;
            const specPath = path.join(this.currentDir, specFileName);
            const spec = await this.plugin.openAPI.getOpenAPISpec(
                specPath,
                specFileName
            );
            parsedSpec = JSON.parse(spec);
        } catch (err: any) {
            this.plugin.showNotice('Seems there are no spec file?');
            return;
        }

        if (this.swaggerUIBundle) {
            this.swaggerUIBundle({
                spec: parsedSpec,
                domNode: swaggerContainer,
                presets: [
                    this.swaggerUIBundle.presets.apis,
                    this.swaggerUIBundle.SwaggerUIStandalonePreset,
                ],
                layout: 'BaseLayout',
            });
        }
    }

    async getCSS(cssName: string) {
        const basePath = this.app.vault.adapter.basePath;
        const pluginDir = this.plugin.manifest.dir;
        if (!pluginDir) {
            throw new Error('No plugin directory found');
        }

        const fullAssetsPath = path.join(
            basePath,
            pluginDir,
            'assets/swagger-ui'
        );
        const cssPath = path.join(fullAssetsPath, cssName);

        const cachedCSS = this.cssCache.get(cssName);
        if (cachedCSS) {
            return cachedCSS;
        }

        try {
            const css = await fs.readFile(cssPath);
            const cssString = css.toString();
            this.cssCache.set(cssName, cssString);
            return cssString;
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
}
