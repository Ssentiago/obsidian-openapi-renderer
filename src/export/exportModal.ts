// import { App, Modal, Setting } from 'obsidian';
// import OpenAPIRendererPlugin from '../core/OpenAPIRendererPlugin';
//
// /**
//  * Represents a modal dialog for exporting options in the plugin.
//  *
//  * This modal allows users to select and execute different export options provided by the plugin.
//  */
// export default class ExportModal extends Modal {
//     plugin!: OpenAPIRendererPlugin;
//
//     constructor(app: App, plugin: OpenAPIRendererPlugin) {
//         super(app);
//         this.plugin = plugin;
//         this.titleEl.textContent = 'Export Options';
//     }
//
//     /**
//      * Method called when the settings modal is opened.
//      *
//      * This method creates and configures the user interface elements within the modal window.
//      * It adds buttons for various export options provided by the plugin, each triggering
//      * the corresponding export functionality when clicked.
//      */
//     onOpen(): void {
//         const { contentEl } = this;
//
//         const settingsContainer = contentEl.createDiv();
//         settingsContainer.addClass('openapi-renderer-settings');
//
//         new Setting(settingsContainer)
//             .setName('Export as CDN')
//             .setDesc(
//                 'Best for most users. The HTML file will link to external CDN resources. ' +
//                     'Keeps file sizes small but needs an internet connection to load resources.'
//             )
//             .addButton((button) => {
//                 button.setIcon('cloud').onClick(async () => {
//                     await this.plugin.export.exportCDN();
//                 });
//             });
//
//         new Setting(settingsContainer)
//             .setName('Export with all dependencies in one HTML file')
//             .setDesc(
//                 'All resources, including code and CSS, will be embedded in the HTML file.' +
//                     'This results in larger file sizes, but ensures complete offline functionality.' +
//                     'Best for offline use or high security needs. '
//             )
//             .addButton((button) => {
//                 button.setIcon('package').onClick(async () => {
//                     await this.plugin.export.exportFullyLocally();
//                 });
//             });
//
//         new Setting(settingsContainer)
//             .setName('Export as ZIP')
//             .setDesc(
//                 'Export the HTML file as a ZIP archive, ' +
//                     'including all necessary files and assets, with no external dependencies.'
//             )
//             .addButton((button) => {
//                 button.setIcon('archive').onClick(async () => {
//                     await this.plugin.export.exportZip();
//                 });
//             });
//     }
//
//     /**
//      * Method called when the settings modal is closed.
//      *
//      * This method clears the content of the modal window to free up resources.
//      * It is responsible for removing all elements from the modal when it is closed.
//      */
//     onClose(): void {
//         const { contentEl } = this;
//         contentEl.empty();
//     }
// }
