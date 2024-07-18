import {OpenAPIPluginContext} from "../contextManager";
import {OpenAPIMarkdownProcessorInterface, ParseResult} from "../typing/interfaces";
import {CachedMetadata, Editor, MarkdownPostProcessorContext, MarkdownView, SectionCache} from 'obsidian';

/**
 * Class representing an OpenAPI Markdown processor.
 */
export default class OpenAPIMarkdownProcessor implements OpenAPIMarkdownProcessorInterface {
    appContext: OpenAPIPluginContext;

    constructor(appContext: OpenAPIPluginContext) {
        this.appContext = appContext;
    }

    /**
     * Registers a Markdown code block processor for OpenAPI.
     * Binds the processing function to the current instance.
     */
    async registerProcessor(): Promise<void> {
        this.appContext.plugin.registerMarkdownCodeBlockProcessor("openapi", this.process.bind(this));
    }

    /**
     * Processes the source content and updates the DOM element with the result.
     * @async
     * @param source - The source content to process.
     * @param el - The HTML element where the processed content will be appended.
     * @param ctx - The context object providing additional information for processing.
     * @returns A promise that resolves when processing is complete.
     */
    async process(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): Promise<void> {
        const params = await this.parseParams(source)
        if (!params.success) {
            if (params.error) {
                const errorDiv = el.createEl('div');
                errorDiv.setText(params.error)
                return;
            }
        }

        const iframe = this.appContext.plugin.openAPI.createIframe(params.params!)
        el.appendChild(iframe)
    }

    /**
     * Parses the source string to extract parameters for rendering OpenAPI content.
     * Validates the parameters and checks for required values.
     * @async
     * @private
     * @param source - The source string containing parameters.
     * @returns A promise resolving to an object containing parsing results.
     */
    private async parseParams(source: string): Promise<ParseResult> {
        const lines = source.trim().split('\n')
        if (!(lines.length === 4)) {
            return this.createErrorResult('Missing one or more required parameters or too many parameters. Expected 4 parameters: openapi-spec, openapi-html, width, height')
        }

        const sectionParts = lines.map(line => line.split(/:\s*/));

        if (!this.isValidParamsNames(sectionParts)) {
            return this.createErrorResult("Invalid parameter names or order. Expected, one per line: openapi-spec, openapi-html, width, height")
        }
        const [specPath, htmlPath, width, height] = sectionParts.map(line => line[1].trim());

        if (!specPath || !htmlPath || !width || !height) {
            return this.createErrorResult("Missing one or more required parameters value: openapi-spec, openapi-html, width, height")
        }

        const existsSpec = await this.appContext.app.vault.adapter.exists(specPath)
        if (!existsSpec) {
            return this.createErrorResult(`Spec file does not exist: ${specPath}`)
        }

        if (!this.isValidDimensions(width, height)) {
            return this.createErrorResult('Dimensions are incorrect: width or/and height. Please use a number followed by % or px (e.g. "100%", "500px"), or just a number for pixels.')

        }

        return {
            success: true,
            params: {
                specPath: specPath,
                htmlPath: htmlPath,
                width: width,
                height: height
            },
            error: null,
        }


    }

    /**
     * Validates the names and order of parameters extracted from a section.
     * @param sectionParts - An array of parameter sections, each containing [name, value].
     * @returns True if the parameter names and order are valid; otherwise, false.
     */
    private isValidParamsNames(sectionParts: string[][]): boolean {
        const paramsNames = sectionParts.map(line => line[0].trim())
        const expectedParamNames = ['openapi-spec', 'openapi-html', 'width', 'height'];
        return paramsNames.every((name, index) => name === expectedParamNames[index])
    }

    /**
     * Validates the dimensions (width and height) based on specified criteria.
     * @param width - The width dimension to validate.
     * @param height - The height dimension to validate.
     * @returns True - if both width and height dimensions are valid; otherwise, false.
     */
    private isValidDimensions(width: string, height: string): boolean {
        const [isValidWidth, isValidHeight] = [width, height]
            .map(value => value ? value.match(/^\d+(%|px)?$/) !== null : false);
        return [isValidWidth, isValidHeight].every(Boolean);
    }

    /**
     * Creates an error result for parsing.
     * @param error - The error message.
     * @returns A ParseResult object indicating failure with the specified error message.
     */
    private createErrorResult(error: string): ParseResult {
        return {
            success: false,
            params: null,
            error: error,
        };
    }



    /**
     * Inserts an OpenAPI block into a Markdown view if one does not already exist.
     * @async
     * @param view - The Markdown view where the block should be inserted.
     * @param htmlFilePath -The file path to the HTML file associated with the OpenAPI block.
     * @param specFilePath - The file path to the OpenAPI specification file.
     * @returns A promise that resolves when the block is inserted.
     */
    async insertOpenAPIBlock(view: MarkdownView, htmlFilePath: string, specFilePath: string): Promise<void> {
        const file = view.file;
        const editor = view.editor;

        const cache = this.appContext.app.metadataCache.getFileCache(file!);
        const isOpenAPIBlock = this.hasOpenAPIBlock(cache, editor);
        !isOpenAPIBlock && await this.insertNewBlock(editor, htmlFilePath, specFilePath);
    }

    /**
     * Inserts a new OpenAPI block into the editor with specified HTML and specification file paths.
     * @private
     * @param editor - The editor instance where the block should be inserted.
     * @param htmlFilePath - The file path to the HTML file associated with the OpenAPI block.
     * @param specFilePath - The file path to the OpenAPI specification file.
     * @returns A promise that resolves when the block is inserted.
     */
    private async insertNewBlock(editor: Editor, htmlFilePath: string, specFilePath: string): Promise<void> {
        const width = this.appContext.plugin.settings.iframeWidth
        const height = this.appContext.plugin.settings.iframeHeight
        const newBlock = `\`\`\`openapi\nopenapi-spec: ${specFilePath}\nopenapi-html: ${htmlFilePath}\nwidth: ${width}\nheight: ${height}\n\`\`\``
        const lastLine = editor.lastLine();
        editor.replaceRange(newBlock, {line: lastLine, ch: editor.getLine(lastLine).length});
    }

    /**
     * Checks if the Markdown file cache contains any OpenAPI code blocks.
     * @private
     * @param cache - The metadata cache of the Markdown file.
     * @param editor - The editor instance to check for OpenAPI blocks.
     * @returns True if the Markdown file contains at least one OpenAPI code block; otherwise, false.
     */
    private hasOpenAPIBlock(cache: CachedMetadata | null, editor: Editor): boolean {
        return !!cache?.sections?.some(section =>
            section.type === 'code' &&
            this.isOpenAPIBlockContent(editor, section)
        );
    }

    /**
     * Checks if the content of a section cache represents an OpenAPI code block.
     * @private
     * @param editor - The editor instance containing the content.
     * @param section - The section cache representing a section of content.
     * @returns True if the content at the specified section cache starts with '```openapi'; otherwise, false.
     */
    private isOpenAPIBlockContent(editor: Editor, section: SectionCache): boolean {
        const firstLine = editor.getLine(section.position.start.line);
        return firstLine.trim().startsWith('```openapi');
    }
}