import SwaggerUiCss from 'assets/swagger-ui/swagger-ui-base.css';
import SwaggerUiDarkCss from 'assets/swagger-ui/swagger-ui-dark.css';
import SwaggerUiFixesCss from 'assets/swagger-ui/swagger-ui-fixes.css';
import SwaggerUiLightCss from 'assets/swagger-ui/swagger-ui-light.css';
import OpenAPIRendererPlugin from 'main';
import { moment, TFile } from 'obsidian';
import { convertData } from 'ui/common/helpers';
import Yazl from 'yazl';

import { RenderedSpec } from './interfaces';

const API_EXTENSIONS = ['yaml', 'yml', 'json'];
const API_MARKER = /^\s*["']?(openapi|swagger)["']?\s*:/m;

export default class Export {
    private bundleCache: string | null = null;

    constructor(public plugin: OpenAPIRendererPlugin) {}

    /**
     * Reads the Swagger UI runtime shipped in the plugin assets folder.
     *
     * The source is cached after the first read. Returns null when the asset
     * is not shipped, so the caller can fall back to a CDN include.
     *
     * @return {Promise<string|null>} The bundle source, or null when unavailable.
     */
    private async loadSwaggerBundle(): Promise<string | null> {
        if (this.bundleCache !== null) {
            return this.bundleCache;
        }
        const pluginDir = this.plugin.manifest.dir;
        if (!pluginDir) {
            return null;
        }
        try {
            const content = await this.plugin.app.vault.adapter.read(
                `${pluginDir}/swagger-ui-bundle.js`
            );
            this.bundleCache = content;
            return content;
        } catch {
            return null;
        }
    }

    /**
     * Generates standalone HTML for Swagger UI based on the provided specification.
     *
     * The page is self-contained: styles are inlined from the bundled Swagger UI
     * stylesheets and the Swagger UI runtime is inlined from the plugin assets,
     * so the export works offline. The specification is embedded as JSON with
     * every `<` escaped, so a `</script>` sequence inside example payloads cannot
     * break out of the script element.
     *
     * @param {string} spec - The specification JSON text to render.
     * @return {Promise<string>} The generated HTML for Swagger UI.
     */
    private async renderSwaggerUIHtml(spec: string): Promise<string> {
        const safeSpec = spec.replace(/</g, '\\u003c');
        const bundle = await this.loadSwaggerBundle();
        const bundleTag = bundle
            ? `<script>${bundle.replace(/<\/script/gi, '<\\/script')}</script>`
            : '<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>';

        return `<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Swagger UI</title>
        <style>${SwaggerUiCss}</style>
        <style>${SwaggerUiLightCss}</style>
        <style>
@media (prefers-color-scheme: dark) {
${SwaggerUiDarkCss}
}
        </style>
        <style>${SwaggerUiFixesCss}</style>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script id="openapi-spec" type="application/json">${safeSpec}</script>
        ${bundleTag}
        <script>
            window.onload = function () {
                const spec = JSON.parse(
                    document.getElementById('openapi-spec').textContent
                );
                SwaggerUIBundle({
                    spec: spec,
                    dom_id: '#swagger-ui',
                    presets: [
                        SwaggerUIBundle.presets.apis,
                        SwaggerUIBundle.SwaggerUIStandalonePreset,
                    ],
                    layout: 'BaseLayout',
                });
            };
        </script>
    </body>
</html>`;
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
            html: await this.renderSwaggerUIHtml(spec),
            time: Date.now(),
        };
    }

    /**
     * Returns the folder all export artifacts are written to, creating it and
     * any missing parents along the way. An empty setting means the vault root.
     *
     * @return {Promise<string>} The vault-relative folder path, or '' for the root.
     */
    private async ensureExportDir(): Promise<string> {
        const folder = (this.plugin.settings.exportFolder ?? '')
            .trim()
            .replace(/^\/+|\/+$/g, '');
        if (!folder) {
            return '';
        }
        let current = '';
        for (const segment of folder.split('/').filter(Boolean)) {
            current = current ? `${current}/${segment}` : segment;
            const exists = await this.plugin.app.vault.adapter.exists(current);
            if (!exists) {
                await this.plugin.app.vault.createFolder(current);
            }
        }
        return folder;
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
            const exportDir = await this.ensureExportDir();
            const exportPath = exportDir
                ? `${exportDir}/export-${sanitizedName}-${time}.html`
                : `export-${sanitizedName}-${time}.html`;

            await this.plugin.app.vault.adapter.write(
                exportPath,
                rendered.html
            );
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
            this.plugin.logger.error(
                `Failed to export files: ${error.message}`
            );
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
                const exportDir = await this.ensureExportDir();
                const zipFilePath = exportDir
                    ? `${exportDir}/export-openapi-data-${time}.zip`
                    : `export-openapi-data-${time}.zip`;

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
