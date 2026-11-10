import { convertData } from 'ui/common/helpers';
import OpenAPIRendererPlugin from 'main';
import { moment, TFile } from 'obsidian';
import Yazl from 'yazl';
import { RenderedSpec } from './interfaces';

const API_EXTENSIONS = ['yaml', 'yml', 'json'];
const API_MARKER = /^\s*["']?(openapi|swagger)["']?\s*:/m;

export default class Export {
    constructor(public plugin: OpenAPIRendererPlugin) {}

    /**
     * Generates HTML for Swagger UI based on the provided specification.
     *
     * @param {string} spec - The specification to be used for generating Swagger UI.
     * @return {string} The generated HTML for Swagger UI.
     */
    private renderSwaggerUIHtml(spec: string): string {
        return `
            <!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Swagger UI</title>
        <link
            rel="stylesheet"
            href="https://unpkg.com/swagger-ui-dist@3/swagger-ui.css"
        />
        <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script>
            window.onload = function() {
                let spec = ${spec};
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
     * Reads a vault file and renders it as a standalone Swagger UI page.
     *
     * @param {TFile} file - The specification file to render.
     * @return {Promise<RenderedSpec>} The rendered page with its metadata.
     */
    private async renderFile(file: TFile): Promise<RenderedSpec> {
        const content = await this.plugin.app.vault.cachedRead(file);
        const spec = convertData(content, file.extension.toLowerCase());
        return {
            name: file.basename,
            path: file.path,
            html: this.renderSwaggerUIHtml(spec),
            time: Date.now(),
        };
    }

    /**
     * Collects all vault files that look like OpenAPI specifications.
     *
     * @return {Promise<TFile[]>} Files whose content declares an openapi or swagger key.
     */
    private async collectApiFiles(): Promise<TFile[]> {
        const candidates = this.plugin.app.vault.getFiles().filter((file) => {
            return API_EXTENSIONS.includes(file.extension.toLowerCase());
        });

        const apiFiles: TFile[] = [];
        for (const file of candidates) {
            const content = await this.plugin.app.vault.cachedRead(file);
            if (API_MARKER.test(content)) {
                apiFiles.push(file);
            }
        }
        return apiFiles;
    }

    /**
     * Exports the given specification file as a standalone Swagger UI page
     * written to the vault root.
     *
     * @param {TFile} file - The specification file to export.
     * @return {Promise<void>} A promise that resolves when the file is written.
     */
    async exportCurrent(file: TFile): Promise<void> {
        try {
            const rendered = await this.renderFile(file);
            const sanitizedName = file.basename.replace(/[^a-zA-Z0-9-_]/g, '_');
            const time = moment().format('YYYYMMDDHHmmss');
            const exportPath = `export-${sanitizedName}-${time}.html`;

            await this.plugin.app.vault.adapter.write(exportPath, rendered.html);
            this.plugin.showNotice(`Exported to ${exportPath}`);
        } catch (error: any) {
            this.plugin.showNotice('Failed to export file');
            this.plugin.logger.error(`Failed to export file: ${error.message}`);
        }
    }

    /**
     * Exports every OpenAPI specification found in the vault as a ZIP archive
     * of standalone Swagger UI pages written to the vault root.
     *
     * @return {Promise<void>} A promise that resolves when the archive is written.
     */
    async exportAll(): Promise<void> {
        try {
            const apiFiles = await this.collectApiFiles();
            if (apiFiles.length === 0) {
                this.plugin.showNotice('No OpenAPI files found');
                return;
            }

            const rendered = await Promise.all(
                apiFiles.map((file) => this.renderFile(file))
            );
            await this.handleZip(rendered);
        } catch (error: any) {
            this.plugin.showNotice('Failed to export files');
            this.plugin.logger.error(`Failed to export files: ${error.message}`);
        }
    }

    /**
     * Adds the rendered specifications to a ZIP file.
     *
     * @param {Yazl.ZipFile} zip - The ZIP file to add the files to.
     * @param {RenderedSpec} spec - The rendered specification to add.
     * @return {void}
     */
    private addFileToZip(zip: Yazl.ZipFile, spec: RenderedSpec): void {
        const folder = spec.path.match(/(.+)\..+$/)?.[1] ?? spec.name;
        const time = moment(spec.time).format('YYYYMMDDHHmmss');
        const filePath = `${folder}-${spec.name}-${time}.html`;

        zip.addBuffer(Buffer.from(spec.html, 'utf8'), filePath);
    }

    /**
     * Handles the creation and saving of a ZIP file from the given rendered
     * specifications.
     *
     * @param {RenderedSpec[]} specs - The rendered specifications to archive.
     * @return {Promise<void>} A promise that resolves when the archive is written.
     */
    private async handleZip(specs: RenderedSpec[]): Promise<void> {
        const zip = new Yazl.ZipFile();

        specs.forEach((spec) => this.addFileToZip(zip, spec));

        new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];

            zip.outputStream
                .on('data', (chunk) => chunks.push(chunk))
                .on('end', () => resolve(Buffer.concat(chunks)))
                .on('error', reject);

            zip.end();
        })
            .then(async (buffer) => {
                const time = moment().format('YYYYMMDDHHmmss');
                const zipFilePath = `export-openapi-data-${time}.zip`;

                await this.plugin.app.vault.adapter.writeBinary(
                    zipFilePath,
                    buffer
                );
                this.plugin.showNotice(`Exported to ${zipFilePath}`);
            })
            .catch((err) => {
                this.plugin.logger.error(
                    `Error when handling ZIP file: ${err.message}`
                );
            });
    }
}
