import {OpenAPIPluginContext} from "../contextManager";
import {MarkdownView} from "obsidian";
import path from "path";
import * as fs from "node:fs";
import Mustache from "mustache";
import Yazl from "yazl";
import Utils from './utils'


export class Export {
    appContext: OpenAPIPluginContext
    basePath: string;
    pluginPath: string | undefined;
    utils: Utils

    constructor(appContext: OpenAPIPluginContext) {
        this.appContext = appContext;
        this.basePath = this.appContext.app.vault.getRoot().vault.adapter.basePath
        this.pluginPath = this.appContext.plugin.manifest.dir
        this.utils = new Utils(this)
    }


    async exportCDN() {
        const currentDir = this.utils.getCurrentDir();
        const template = await this.utils.getTemplateContent()
        if (currentDir && template) {
            const specContent = await this.utils.getSpecContent(currentDir)
            const cssLink = '<link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3/swagger-ui.css">'
            const swaggerJSLink = '<script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js"></script>'
            const renderedTemplate = this.utils.renderTemplate(template, specContent, cssLink, swaggerJSLink);
            const htmlName = this.appContext.plugin.settings.openapiSpecFileName
                .replace(/\..+$/, '.html')
            await this.utils.writeRenderedTemplate(currentDir, renderedTemplate, htmlName);
            this.appContext.plugin.showNotice("Export complete: HTML file with CDN links has been successfully created.");
        }
    }

    async exportFullyLocally() {
        debugger
        const currentDir = this.utils.getCurrentDir();
        const template = await this.utils.getTemplateContent()
        if (currentDir && this.pluginPath && template) {
            const specContent = await this.utils.getSpecContent(currentDir)
            const cssPath = path.join(this.basePath, this.pluginPath, 'assets/swagger-ui/swagger-ui.module.css')
            const swaggerJSPath = path.join(this.basePath, this.pluginPath, 'assets/swagger-ui/swagger-ui-bundle.module.js')

            const cssContent = fs.readFileSync(cssPath, 'utf8');
            const swaggerJSContent = fs.readFileSync(swaggerJSPath, 'utf8');
            const cssElement = `<style>${cssContent}</style>`;
            const jsElement = `<script>${swaggerJSContent}</script>`;

            const renderedTemplate = this.utils.renderTemplate(template, specContent, cssElement, jsElement);
            const htmlName = this.appContext.plugin.settings.openapiSpecFileName
                .replace(/\..+$/, '.html')
            await this.utils.writeRenderedTemplate(currentDir, renderedTemplate, htmlName);

            this.appContext.plugin.showNotice("Export complete: HTML file with local CSS and JS has been successfully created.");
        }
    }

    async exportZip() {
        const currentDir = this.utils.getCurrentDir();
        if (currentDir && this.pluginPath) {
            const assetsDir = path.join(this.basePath, this.pluginPath, 'assets');
            const archiveName = this.appContext.plugin.settings.openapiSpecFileName
                .replace(/\..+$/, '')
            const output = path.join(this.basePath, currentDir, `${archiveName}.zip`);
            const templateContent = await this.utils.getTemplateContent();
            const specContent = await this.utils.getSpecContent(currentDir);
            if (templateContent) {
                const zip = new Yazl.ZipFile();

                await this.utils.addFilesToZip(zip, assetsDir, assetsDir, ['template.html'], templateContent, specContent);

                zip.end();
                zip.outputStream.pipe(fs.createWriteStream(output))
                    .on('finish', () => this.appContext.plugin.showNotice("Archive created successfully: " +
                        "All files and templates have been packed into a ZIP."))
            }

        }
    }
}


