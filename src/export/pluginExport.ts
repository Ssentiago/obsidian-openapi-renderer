// import OpenAPIPluginContext from '../core/contextManager';
// import path from 'path';
// import * as fs from 'node:fs';
// import Yazl from 'yazl';
// import Utils from './utils';
//
// export default class Export {
//     appContext: OpenAPIPluginContext;
//     basePath: string;
//     pluginPath: string | undefined;
//     utils: Utils;
//
//     constructor(appContext: OpenAPIPluginContext) {
//         this.appContext = appContext;
//         this.basePath =
//             this.appContext.app.vault.getRoot().vault.adapter.basePath;
//         this.pluginPath = this.appContext.plugin.manifest.dir;
//         this.utils = new Utils(this);
//     }
//
//     /**
//      * Exports OpenAPI spec as HTML with CDN links.
//      *
//      * Fetches the current directory, template, and spec content, renders the template with CDN links,
//      * saves the HTML file, and shows a success notice.
//      *
//      * @returns {Promise<void>}
//      */
//     async exportCDN(): Promise<void> {
//         const currentDir = this.utils.getCurrentDir();
//         if (!currentDir) {
//             this.appContext.plugin.showNotice('No current file open');
//             return;
//         }
//         const template = await this.utils.getTemplateContent();
//         if (template) {
//             const specContent = await this.utils.getSpecContent(currentDir);
//             if (!specContent) {
//                 return;
//             }
//
//             const cssLink =
//                 '<link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3/swagger-ui.css">';
//             const swaggerJSLink =
//                 '<script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js"></script>';
//             const renderedTemplate = this.utils.renderTemplate(
//                 template,
//                 specContent,
//                 cssLink,
//                 swaggerJSLink
//             );
//             const htmlName =
//                 this.appContext.plugin.settings.openapiSpecFileName.replace(
//                     /\..+$/,
//                     '.html'
//                 );
//             await this.utils.writeRenderedTemplate(
//                 currentDir,
//                 renderedTemplate,
//                 htmlName
//             );
//             this.appContext.plugin.showNotice(
//                 'Export complete: HTML file with CDN links has been successfully created.'
//             );
//         }
//     }
//
//     /**
//      * Exports OpenAPI spec as HTML with all resources embedded locally.
//      *
//      * Retrieves the current directory, template, and spec content, embeds local CSS and JS in the HTML,
//      * saves the HTML file, and displays a success notice.
//      *
//      * @returns {Promise<void>}
//      */
//     async exportFullyLocally(): Promise<void> {
//         const currentDir = this.utils.getCurrentDir();
//         if (!currentDir) {
//             this.appContext.plugin.showNotice('No current file open');
//             return;
//         }
//         const template = await this.utils.getTemplateContent();
//         if (this.pluginPath && template) {
//             const specContent = await this.utils.getSpecContent(currentDir);
//             if (!specContent) {
//                 return;
//             }
//             const cssPath = path.join(
//                 this.basePath,
//                 this.pluginPath,
//                 'assets/swagger-ui/swagger-ui-base.css'
//             );
//             const swaggerJSPath = path.join(
//                 this.basePath,
//                 this.pluginPath,
//                 'assets/swagger-ui/swagger-ui-bundle.js'
//             );
//
//             const cssContent = fs.readFileSync(cssPath, 'utf8');
//             const swaggerJSContent = fs.readFileSync(swaggerJSPath, 'utf8');
//             const cssElement = `<style>${cssContent}</style>`;
//             const jsElement = `<script>${swaggerJSContent}</script>`;
//
//             const renderedTemplate = this.utils.renderTemplate(
//                 template,
//                 specContent,
//                 cssElement,
//                 jsElement
//             );
//             const htmlName =
//                 this.appContext.plugin.settings.openapiSpecFileName.replace(
//                     /\..+$/,
//                     '.html'
//                 );
//             await this.utils.writeRenderedTemplate(
//                 currentDir,
//                 renderedTemplate,
//                 htmlName
//             );
//
//             this.appContext.plugin.showNotice(
//                 'Export complete: HTML file with local CSS and JS has been successfully created.'
//             );
//         }
//     }
//
//     /**
//      * Exports OpenAPI spec and related files as a ZIP archive.
//      *
//      * Retrieves the current directory and assets, creates a ZIP file containing the HTML template and spec content,
//      * and saves the ZIP file to the specified location. Displays a success notice upon completion.
//      *
//      * @returns {Promise<void>}
//      */
//     async exportZip(): Promise<void> {
//         const currentDir = this.utils.getCurrentDir();
//         if (!currentDir) {
//             this.appContext.plugin.showNotice('No current file open');
//             return;
//         }
//
//         if (currentDir && this.pluginPath) {
//             const assetsDir = path.join(
//                 this.basePath,
//                 this.pluginPath,
//                 'assets'
//             );
//             const archiveName =
//                 this.appContext.plugin.settings.openapiSpecFileName.replace(
//                     /\..+$/,
//                     ''
//                 );
//             const output = path.join(
//                 this.basePath,
//                 currentDir,
//                 `${archiveName}.zip`
//             );
//             const templateContent = await this.utils.getTemplateContent();
//             const specContent = await this.utils.getSpecContent(currentDir);
//             if (!specContent) {
//                 return;
//             }
//             if (templateContent) {
//                 const zip = new Yazl.ZipFile();
//
//                 await this.utils.addFilesToZip(
//                     zip,
//                     assetsDir,
//                     assetsDir,
//                     ['template.html'],
//                     templateContent,
//                     specContent
//                 );
//
//                 zip.end();
//                 zip.outputStream
//                     .pipe(fs.createWriteStream(output))
//                     .on('finish', () =>
//                         this.appContext.plugin.showNotice(
//                             'Export complete: All files and templates have been ' +
//                                 'successfully packed into a ZIP archive.'
//                         )
//                     );
//             }
//         }
//     }
// }
