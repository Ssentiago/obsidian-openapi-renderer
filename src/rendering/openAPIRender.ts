import {OpenAPIRendererInterface, Params, ParsedParams, PowerOffEvent, PreviewHandlerInterface} from "../typing/interfaces";
import {OpenAPIPluginContext} from "../contextManager";
import path from "path";
import {MarkdownView, WorkspaceLeaf} from "obsidian";
import {SwaggerUIModal} from 'rendering/swaggerUIModal'
import {eventID, RenderingMode} from "../typing/constants";

/**
 * Class representing an OpenAPI renderer.
 */
export class OpenAPIRenderer implements OpenAPIRendererInterface {
    appContext: OpenAPIPluginContext;


    constructor(appContext: OpenAPIPluginContext) {
        this.appContext = appContext;
    };

    /**
     * Renders OpenAPI resources based on the specified rendering mode.
     * @param view - The MarkdownView to render into.
     * @param mode - The rendering mode (Inline or Modal).
     */
    async renderOpenAPIResources(view: MarkdownView, mode: RenderingMode): Promise<void> {
        try {
            const result = await this.renderHTML(view);
            if (result.htmlFilePath && result.specFilePath) {
                switch (mode) {
                    case RenderingMode.Inline:
                        await this.appContext.plugin.markdownProcessor.insertOpenAPIBlock(view, result.htmlFilePath, result.specFilePath);
                        this.appContext.plugin.showNotice('New OpenAPI Swagger UI was rendered');
                        break;
                    case RenderingMode.Modal:
                        const width = this.appContext.plugin.settings.iframeWidth;
                        const height = this.appContext.plugin.settings.iframeHeight;
                        const iframeCreator = this.createIframe.bind(this.appContext.plugin);
                        new SwaggerUIModal(this.appContext.app, result.htmlFilePath,
                            result.specFilePath, width, height, iframeCreator).open();
                        break;
                }
            }
        } catch (error: any) {
            this.appContext.plugin.showNotice(error.message);
        }
    }

    /**
     * Renders HTML content for OpenAPI Swagger UI based on the current MarkdownView.
     * @param view - The MarkdownView to render into.
     * @returns An object containing paths to the generated spec and HTML files.
     * @throws Error if no file is currently open or if there's an issue with file operations.
     */
    private async renderHTML(view: MarkdownView): Promise<{ specFilePath: string; htmlFilePath: string }> {

        const currentFile = view.file;

        if (!currentFile) {
            throw new Error('No file is currently open')
        }

        const parentFolder = currentFile.parent ?? currentFile.vault.getRoot();

        const currentDir = parentFolder.path;
        const specName = this.appContext.plugin.settings.openapiSpecFileName;
        const specFilePath = path.join(currentDir, specName)

        const specContent = await this.getOpenAPISpec(specFilePath, specName);

        const htmlContent = this.generateSwaggerUI(specContent!);

        const htmlFileName = this.appContext.plugin.settings.htmlFileName;

        const htmlFilePath = path.join(currentDir, htmlFileName)

        await this.appContext.app.vault.adapter.write(htmlFilePath, htmlContent);
        return {
            specFilePath: specFilePath,
            htmlFilePath: htmlFilePath
        }
    };

    /**
     * Retrieves and processes the content of an OpenAPI specification file.
     * @param specFilePath - The file path of the OpenAPI specification.
     * @param specFileName - The name of the OpenAPI specification file.
     * @returns The processed content of the OpenAPI specification.
     * @throws Error if the specification file is not found or if there's an issue reading the file.
     */
    private async getOpenAPISpec(specFilePath: string, specFileName: string): Promise<string> {
        const existSpec = await this.appContext.app.vault.adapter.exists(specFilePath);
        if (!existSpec) {
            throw new Error('The specification file was not found');
        }
        const content = await this.appContext.app.vault.adapter.read(specFilePath);
        const extension = specFileName.substring(specFileName.lastIndexOf(".") + 1,).toLowerCase();
        switch (extension) {
            case 'yaml':
            case 'yml' :
                return content.replace(/\t/g, '    ');
            case 'json':
                return content;
            default:
                throw new Error('The specification file was not found')
        }
    };


    /**
     * Generates HTML content for displaying Swagger UI based on the provided OpenAPI specification content.
     * @param specContent - The content of the OpenAPI specification.
     * @returns The generated HTML content with embedded Swagger UI.
     */
    private generateSwaggerUI(specContent: string): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3/swagger-ui.css">
    <style>
        html { box-sizing: border-box; overflow-moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin: 0; background: #fafafa; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js"></script>
    <script>
        window.onload = function() {
            const spec = jsyaml.load(${JSON.stringify(specContent)});
            const ui = SwaggerUIBundle({
                spec: spec,
                dom_id: '#swagger-ui',
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.SwaggerUIStandalonePreset
                ],
                layout: "BaseLayout"
            });
        }
    </script>
</body>
</html>
        `;
    }

    /**
     * Creates an iframe element for embedding content based on provided parameters.
     * @param params - Parameters containing HTML path, width, and height for the iframe.
     * @returns The created iframe element.
     */
    createIframe(params: ParsedParams | Params): HTMLIFrameElement {
        const iframe = document.createElement("iframe");
        iframe.id = 'openapi-iframe';
        iframe.src = path.normalize(`http://${this.appContext.plugin.server.serverAddress}/${params!.htmlPath}`)
        iframe.width = params!.width;
        iframe.height = params!.height;
        return iframe
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
        )
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

        const unit = this.appContext.plugin.settings.timeoutUnit === 'milliseconds' ? 1 : 1000
        const timeout = this.appContext.plugin.settings.timeout * unit
        this.updateTimeout = setTimeout(async () => {
            const view = this.appContext.app.workspace.getActiveViewOfType(MarkdownView)
            if (view) {
                await this.appContext.plugin.previewHandler.previewAutoUpdate(view);
            }
        }, timeout);


    }

    /**
     * Performs an automatic update of the OpenAPI preview for a given MarkdownView.
     * @param view - The MarkdownView to update with OpenAPI resources.
     */
    private async previewAutoUpdate(view: MarkdownView): Promise<void> {
        if (this.appContext.plugin.settings.isAutoUpdate) {
            await this.appContext.plugin.openAPI.renderOpenAPIResources(view, RenderingMode.Inline);
            this.rerenderPreview(view)
            this.appContext.plugin.showNotice('OpenAPI preview was automatically updated');
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
        this.rerenderPreview(view)
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
