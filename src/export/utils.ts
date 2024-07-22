import {MarkdownView} from "obsidian";
import path from "path";
import fs from "node:fs";
import Mustache from "mustache";
import Yazl from "yazl";
import {Export} from "./pluginExport";

export default class Utils {
    export: Export

    constructor(exportClass: Export) {
        this.export = exportClass
    }


    getCurrentDir() {
        const view = this.export.appContext.app.workspace.getActiveViewOfType(MarkdownView)

        const currentFile = view?.file
        if (!currentFile) {
            return;
        }

        const parentFolder = currentFile.parent ?? currentFile.vault.getRoot();
        const currentDir = parentFolder.path;
        return currentDir
    }

    async getTemplateContent() {
        if (this.export.pluginPath) {
            const templatePath = 'assets/export-template.html'
            const fullPath = path.join(this.export.basePath, this.export.pluginPath, templatePath)
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                return content
            } catch (err: any) {
                this.export.appContext.plugin.logger.error(err.message)
            }
        }
    }

    async getSpecContent(currentDir: string) {
        const specFileName = this.export.appContext.plugin.settings.openapiSpecFileName;
        const specPath = path.join(currentDir, specFileName);
        return this.export.appContext.plugin.openAPI.getOpenAPISpec(specPath, specFileName);
    }

    async writeRenderedTemplate(currentDir: string,
                                renderedTemplate: string,
                                fileName: string) {
        await this.export.appContext.app.vault.adapter.write(path.join(currentDir, fileName), renderedTemplate);
    }

    renderTemplate(templateContent: string, specContent: string, css: string, js: string): string {
        return Mustache.render(templateContent, {
            swaggerCSS: css,
            swaggerJS: js,
            specContent: specContent
        });
    }


    async addFilesToZip(zip: Yazl.ZipFile,
                        dirPath: string,
                        baseDir: string,
                        excludeList: string[],
                        templateContent: string,
                        specContent: string) {
        const files = fs.readdirSync(dirPath);
        const tasks: Promise<void>[] = [];

        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                tasks.push(this.addFilesToZip(zip, filePath, baseDir, excludeList, templateContent, specContent));
            } else {
                if (!excludeList.includes(file)) {
                    if (file === 'export-template.html') {
                        const renderedTemplate = this.renderTemplate(templateContent, specContent,
                            '<link rel="stylesheet" type="text/css" href="./swagger-ui/swagger-ui.module.css">\n',
                            '<script src="./swagger-ui/swagger-ui-bundle.module.js"></script>'
                        );
                        zip.addBuffer(Buffer.from(renderedTemplate, 'utf8'), 'index.html');
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
