import {OpenAPIRendererInterface, Params, ParsedParams, PowerOffEvent, PreviewHandlerInterface} from "../typing/interfaces";
import {OpenAPIPluginContext} from "../contextManager";
import path from "path";
import {MarkdownView, WorkspaceLeaf} from "obsidian";
import {eventID, RenderingMode} from "../typing/types";
import {SwaggerUIModal} from 'rendering/swaggerUIModal'

/**
 * Class representing an OpenAPI renderer.
 */
export class OpenAPIRenderer implements OpenAPIRendererInterface {
    appContext: OpenAPIPluginContext;


    constructor(appContext: OpenAPIPluginContext) {
        this.appContext = appContext;
    };

    /**
     * Renders OpenAPI resources to a Markdown view asynchronously.
     * Generates HTML and specification files based on the rendered HTML view.
     * Displays a notice to refresh preview upon successful rendering.
     * Shows an error notice if rendering fails.
     *
     * @param view - The MarkdownView to render OpenAPI resources into.
     * @param mode - the chosen way to render preview: inline or modal
     */
    async renderOpenAPIResources(view: MarkdownView, mode: RenderingMode) {
        this.renderHTML(view).then((result) => {
            if (result!.htmlFilePath && result!.specFilePath) {

                switch (mode) {
                    case RenderingMode.Inline:
                        this.appContext.plugin.markdownProcessor.insertOpenAPIBlock(view, result!.htmlFilePath, result!.specFilePath)
                        this.appContext.plugin.showNotice('New OpenAPI Swagger UI was rendered')
                        break;
                    case RenderingMode.Modal:
                        const width = this.appContext.plugin.settings.iframeWidth
                        const height = this.appContext.plugin.settings.iframeHeight
                        const iframeCreator = this.createIframe.bind(this.appContext.plugin)
                        debugger
                        new SwaggerUIModal(this.appContext.app, result.htmlFilePath,
                            result.specFilePath, width, height, iframeCreator).open()
                }


            }
        }).catch((error: Error) => {
            this.appContext.plugin.showNotice(error.message)
        })
    }

    /**
     * Renders HTML and OpenAPI specification file for Swagger UI based on the current Markdown view.
     *
     * @param view - The MarkdownView where the Swagger UI will be rendered.
     * @returns An object containing paths to the generated HTML and specification files.
     * @throws Error if no file is currently open or if there's an issue with file operations.
     */
    private async renderHTML(view: MarkdownView) {

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
        const width = this.appContext.plugin.settings.iframeWidth;
        const height = this.appContext.plugin.settings.iframeHeight;

        const htmlFilePath = path.join(currentDir, htmlFileName)

        await this.appContext.app.vault.adapter.write(htmlFilePath, htmlContent);
        return {
            specFilePath: specFilePath,
            htmlFilePath: htmlFilePath
        }
    };

    /**
     * Retrieves the content of an OpenAPI specification file.
     *
     * @param specFilePath - The path to the OpenAPI specification file.
     * @param specFileName - The name of the OpenAPI specification file.
     * @returns The content of the OpenAPI specification file as a string.
     * @throws Error if the specification file is not found or if there's an issue reading the file.
     */
    private async getOpenAPISpec(specFilePath: string, specFileName: string) {
        const existSpec = await this.appContext.app.vault.adapter.exists(specFilePath);
        if (!existSpec) {
            throw new Error('The specification file was not found');
        }
        const content = await this.appContext.app.vault.adapter.read(specFilePath);
        const extension = specFileName.substring(specFileName.lastIndexOf(".") + 1,).toLowerCase();
        switch (extension) {
            case 'yaml':
            case 'yml' :
                const yamlContent = content.replace(/\t/g, '    ');
                return yamlContent;
            case 'json':
                return content;
        }
    };


    /**
     * Generates an HTML page with Swagger UI embedded, displaying the provided OpenAPI specification content.
     *
     * @param specContent - The content of the OpenAPI specification as a string (JSON or YAML).
     * @returns The generated HTML content as a string.
     */
    private generateSwaggerUI(specContent: string) {
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
     * Creates an <iframe> element configured with specified parameters.
     * @private
     * @param params - The parsed parameters containing HTML path, width, and height.
     * @returns <iframe> element configured with the specified parameters.
     */
    createIframe(params: ParsedParams | Params) {
        let iframe = document.createElement("iframe");
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

    async onunload(event: PowerOffEvent) {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
    }

    /**
     * Schedules an automatic update for previewing based on a timeout.
     * Clears any existing update timeout if present.
     */
    async scheduleAutoUpdate() {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        debugger
        const unit = this.appContext.plugin.settings.timeoutUnit === 'milliseconds' ? 1 : 1000
        const timeout = this.appContext.plugin.settings.timeout * unit
        this.updateTimeout = setTimeout(async () => {
            const view = this.appContext.app.workspace.getActiveViewOfType(MarkdownView)
            view && await this.appContext.plugin.previewHandler.previewAutoUpdate(view);
        }, timeout);
        console.log(this.updateTimeout)
    }

    /**
     * Automatically updates the preview of OpenAPI resources in a Markdown view if auto-update is enabled.
     *
     * @param view - The MarkdownView to update the preview for.
     */
    private async previewAutoUpdate(view: MarkdownView) {
        if (view && this.appContext.plugin.settings.isAutoUpdate) {
            await this.appContext.plugin.openAPI.renderOpenAPIResources(view, RenderingMode.Inline);
            this.rerenderPreview(view)
            this.appContext.plugin.showNotice('OpenAPI preview was automatically updated');
        }
    }

    /**
     * Rerenders the preview mode of a MarkdownView instance.
     * This method triggers a re-rendering of the preview content in the MarkdownView.
     *
     * @param view - The MarkdownView instance for which to rerender the preview.
     */
    rerenderPreview(view: MarkdownView) {
        view.previewMode.rerender(true);
    }

    /**
     * Manually refreshes the preview of OpenAPI resources in a Markdown view.
     *
     * @param view - The MarkdownView to refresh the preview for.
     */
    previewManualUpdate(view: MarkdownView) {
        if (!view) {
            this.appContext.plugin.showNotice('No active Markdown view');
            return;
        }
        this.rerenderPreview(view)
        this.appContext.plugin.showNotice('OpenAPI preview refreshed manually');
    }

    /**
     * Sets the view mode of a workspace leaf.
     *
     * @param leaf - The WorkspaceLeaf to set the mode for.
     * @param mode - The mode to set (`source` or `preview`).
     */
    async setViewMode(leaf: WorkspaceLeaf, mode: string) {
        const state = leaf.getViewState();
        state.state.mode = mode;
        state.state.source = mode === 'source';
        await leaf.setViewState(state);
    }
}
