import {
    OpenAPIRendererInterface,
    ParsedParams,
    PowerOffEvent,
    PreviewHandlerInterface,
} from '../typing/interfaces';
import OpenAPIPluginContext from '../core/contextManager';
import path from 'path';
import { MarkdownView, WorkspaceLeaf } from 'obsidian';
import { eventID, RenderingMode } from '../typing/constants';
import yaml from 'js-yaml';

/**
 * Class representing an OpenAPI renderer.
 */
export class OpenAPIRenderer implements OpenAPIRendererInterface {
    appContext: OpenAPIPluginContext;

    constructor(appContext: OpenAPIPluginContext) {
        this.appContext = appContext;
    }

    /**
     * Renders OpenAPI resources based on the specified rendering mode.
     * @param view - The MarkdownView to render into.
     * @param mode - The rendering mode (Inline or Modal).
     */
    async renderOpenAPIResources(
        view: MarkdownView,
        mode: RenderingMode
    ): Promise<void> {
        const currentFile = view.file;

        if (!currentFile) {
            this.appContext.plugin.showNotice('No file is currently open');
            return;
        }
        const parentFolder = currentFile.parent ?? currentFile.vault.getRoot();
        const currentDir = parentFolder.path;
        const specFileName =
            this.appContext.plugin.settings.openapiSpecFileName;

        const specPath = path.join('/', currentDir, specFileName);
        const existsPath =
            await this.appContext.app.vault.adapter.exists(specPath);
        if (!existsPath) {
            this.appContext.plugin.showNotice('Spec file does not exist');
            return;
        }
        switch (mode) {
            case RenderingMode.Inline:
                await this.appContext.plugin.markdownProcessor.insertOpenAPIBlock(
                    view,
                    specPath
                );
                this.appContext.plugin.showNotice(
                    'New OpenAPI Swagger UI was rendered'
                );
                break;
        }
    }

    /**
     * Creates an iframe element for embedding content based on provided parameters.
     * @param params - Parameters containing spec path, width, and height for the iframe.
     * @returns The created iframe element.
     */
    async createIframe(params: ParsedParams): Promise<HTMLIFrameElement> {
        const iframe = document.createElement('iframe');
        iframe.id = 'openapi-iframe';

        const pluginDir = this.appContext.plugin.manifest.dir;
        if (!pluginDir) {
            throw new Error('No plugin dir found');
        }
        const assetsPath = path.join(pluginDir, 'assets');

        const existsAssetsPath =
            await this.appContext.app.vault.adapter.exists(assetsPath);

        if (!existsAssetsPath) {
            throw new Error(
                'No plugin resources dir found. Please download it'
            );
        }

        const baseURL = `http://${this.appContext.plugin.server.serverAddress}/`;
        const templatePath = path.join(assetsPath, 'template.html');
        const specPath = encodeURIComponent(params.specPath);

        iframe.src = path.normalize(
            `${baseURL}${templatePath}?path=${specPath}`
        );
        iframe.width = params!.width;
        iframe.height = params!.height;
        return iframe;
    }

    /**
     * Retrieves and processes the content of an OpenAPI specification file.
     * @param specFilePath - The file path of the OpenAPI specification.
     * @param specFileName - The name of the OpenAPI specification file.
     * @returns The processed content of the OpenAPI specification.
     * @throws Error if the specification file is not found or if there's an issue reading the file.
     */
    async getOpenAPISpec(
        specFilePath: string,
        specFileName: string
    ): Promise<string> {
        const existSpec =
            await this.appContext.app.vault.adapter.exists(specFilePath);
        if (!existSpec) {
            throw new Error('The specification file was not found');
        }
        const content =
            await this.appContext.app.vault.adapter.read(specFilePath);
        const extension = specFileName
            .substring(specFileName.lastIndexOf('.') + 1)
            .toLowerCase();
        switch (extension) {
            case 'yaml':
            case 'yml':
                const data = yaml.load(content.replace(/\t/g, '    '));
                return JSON.stringify(data);
            case 'json':
                return content;
            default:
                throw new Error('The specification file was not found');
        }
    }
}

/**
 * Class representing a preview handler for managing preview updates and view modes.
 */
export class PreviewHandler implements PreviewHandlerInterface {
    appContext: OpenAPIPluginContext;
    updateTimeout!: NodeJS.Timeout;

    constructor(appContext: OpenAPIPluginContext) {
        this.appContext = appContext;
        this.appContext.plugin.observer.subscribe(
            this.appContext.app.workspace,
            eventID.PowerOff,
            this.onunload.bind(this)
        );
    }

    /**
     * Asynchronous method called when unloading due to a power-off event.
     * Clears any existing update timeout if present.
     * @param event - The PowerOffEvent triggering the unload.
     */
    private async onunload(event: PowerOffEvent): Promise<void> {
        clearTimeout(this.updateTimeout);
    }

    /**
     * Schedules an auto-update based on configured timeout settings.
     * Clears any existing update timeout before scheduling a new one.
     * @remarks If the timeout unit is in milliseconds, the unit to multiply is 1; otherwise, it's 1000 (milliseconds).
     */
    async scheduleAutoUpdate(): Promise<void> {
        clearTimeout(this.updateTimeout);

        const unit =
            this.appContext.plugin.settings.timeoutUnit === 'milliseconds'
                ? 1
                : 1000;
        const timeout = this.appContext.plugin.settings.timeout * unit;
        this.updateTimeout = setTimeout(async () => {
            const view =
                this.appContext.app.workspace.getActiveViewOfType(MarkdownView);
            if (view) {
                await this.appContext.plugin.previewHandler.previewAutoUpdate(
                    view
                );
            }
        }, timeout);
    }

    /**
     * Performs an automatic update of the OpenAPI preview for a given MarkdownView.
     * @param view - The MarkdownView to update with OpenAPI resources.
     */
    private async previewAutoUpdate(view: MarkdownView): Promise<void> {
        if (this.appContext.plugin.settings.isHTMLAutoUpdate) {
            await this.appContext.plugin.openAPI.renderOpenAPIResources(
                view,
                RenderingMode.Inline
            );
            this.rerenderPreview(view);
            this.appContext.plugin.showNotice(
                'OpenAPI preview was automatically updated'
            );
        }
    }

    /**
     * Rerender the preview mode of a MarkdownView.
     * @param view - The MarkdownView to rerender.
     */
    rerenderPreview(view: MarkdownView): void {
        view.previewMode.rerender(true);
    }

    /**
     * Manually refreshes the preview of OpenAPI resources in a Markdown view.
     *
     * @param view - The MarkdownView to refresh the preview for.
     */
    previewManualUpdate(view: MarkdownView): void {
        this.rerenderPreview(view);
        this.appContext.plugin.showNotice('OpenAPI preview refreshed manually');
    }

    /**
     * Sets the view mode of a workspace leaf.
     *
     * @param leaf - The WorkspaceLeaf to set the mode for.
     * @param mode - The mode to set (`source` or `preview`).
     */
    async setViewMode(leaf: WorkspaceLeaf, mode: string): Promise<void> {
        const state = leaf.getViewState();
        state.state.mode = mode;
        state.state.source = mode === 'source';
        await leaf.setViewState(state);
    }
}
