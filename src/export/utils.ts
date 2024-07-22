import { MarkdownView } from 'obsidian';
import path from 'path';
import fs from 'node:fs';
import Mustache from 'mustache';
import Yazl from 'yazl';
import Export from './pluginExport';

export default class Utils {
    export: Export;

    constructor(exportClass: Export) {
        this.export = exportClass;
    }

    /**
     * Gets the path of the directory containing the currently active Markdown file.
     *
     * @returns {string | undefined} The directory path if a file is active, otherwise `undefined`.
     */
    getCurrentDir(): string | undefined {
        const view =
            this.export.appContext.app.workspace.getActiveViewOfType(
                MarkdownView
            );

        const currentFile = view?.file;
        if (!currentFile) {
            return;
        }

        const parentFolder = currentFile.parent ?? currentFile.vault.getRoot();
        return parentFolder.path;
    }

    /**
     * Retrieves the content of the export template file.
     *
     * Reads the template file from the constructed path and returns its content.
     * Logs an error if the file cannot be read.
     *
     * @returns {Promise<string | undefined>} The file content or `undefined` if an error occurs.
     */
    async getTemplateContent(): Promise<string | undefined> {
        if (this.export.pluginPath) {
            const templatePath = 'assets/export-template.html';
            const fullPath = path.join(
                this.export.basePath,
                this.export.pluginPath,
                templatePath
            );
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                return content;
            } catch (err: any) {
                this.export.appContext.plugin.logger.error(err.message);
            }
        }
    }

    /**
     * Gets the OpenAPI specification content from a file.
     *
     * @param {string} currentDir - Directory containing the spec file.
     * @returns {Promise<string>} Content of the specification file.
     */
    async getSpecContent(currentDir: string): Promise<string> {
        const specFileName =
            this.export.appContext.plugin.settings.openapiSpecFileName;
        const specPath = path.join(currentDir, specFileName);
        return this.export.appContext.plugin.openAPI.getOpenAPISpec(
            specPath,
            specFileName
        );
    }

    /**
     * Writes the rendered template to a specified file.
     *
     * @param {string} currentDir - Directory where the file will be saved.
     * @param {string} renderedTemplate - Content to write to the file.
     * @param {string} fileName - Name of the file to save.
     * @returns {Promise<void>} Resolves when the file is written.
     */
    async writeRenderedTemplate(
        currentDir: string,
        renderedTemplate: string,
        fileName: string
    ): Promise<void> {
        await this.export.appContext.app.vault.adapter.write(
            path.join(currentDir, fileName),
            renderedTemplate
        );
    }

    /**
     * Renders the template with the provided content.
     *
     * @param {string} templateContent - The HTML template to render.
     * @param {string} specContent - The OpenAPI specification content.
     * @param {string} css - CSS content to include in the rendered template.
     * @param {string} js - JavaScript content to include in the rendered template.
     * @returns {string} The rendered HTML string.
     */
    renderTemplate(
        templateContent: string,
        specContent: string,
        css: string,
        js: string
    ): string {
        return Mustache.render(templateContent, {
            swaggerCSS: css,
            swaggerJS: js,
            specContent: specContent,
        });
    }

    /**
     * Recursively adds files to a ZIP archive.
     *
     * @param {Yazl.ZipFile} zip - The ZIP file instance.
     * @param {string} dirPath - The current directory path.
     * @param {string} baseDir - The base directory path for calculating relative paths.
     * @param {string[]} excludeList - List of filenames to exclude from the ZIP.
     * @param {string} templateContent - The HTML template content.
     * @param {string} specContent - The OpenAPI specification content.
     * @returns {Promise<void>} A promise that resolves when all files have been added.
     */
    async addFilesToZip(
        zip: Yazl.ZipFile,
        dirPath: string,
        baseDir: string,
        excludeList: string[],
        templateContent: string,
        specContent: string
    ): Promise<void> {
        const files = fs.readdirSync(dirPath);
        const tasks: Promise<void>[] = [];

        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                tasks.push(
                    this.addFilesToZip(
                        zip,
                        filePath,
                        baseDir,
                        excludeList,
                        templateContent,
                        specContent
                    )
                );
            } else {
                if (!excludeList.includes(file)) {
                    if (file === 'export-template.html') {
                        const renderedTemplate = this.renderTemplate(
                            templateContent,
                            specContent,
                            '<link rel="stylesheet" type="text/css" href="./swagger-ui/swagger-ui.module.css">\n',
                            '<script src="./swagger-ui/swagger-ui-bundle.module.js"></script>'
                        );
                        zip.addBuffer(
                            Buffer.from(renderedTemplate, 'utf8'),
                            'index.html'
                        );
                    } else {
                        const relativePath = path.relative(baseDir, filePath);
                        zip.addFile(filePath, relativePath);
                    }
                }
            }
        }

        await Promise.all(tasks);
    }
}
