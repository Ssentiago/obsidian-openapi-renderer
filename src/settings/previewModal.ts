import {App, Modal} from "obsidian";
import OpenAPIRendererPlugin from "../main";
import path from "path";
import {Params} from "../typing/interfaces";

/**
 * Modal class for displaying a preview of a predefined HTML file in an iframe within the plugin UI.
 */
export class PreviewModal extends Modal {
    plugin: OpenAPIRendererPlugin

    constructor(app: App, plugin: OpenAPIRendererPlugin) {
        super(app);
        this.plugin = plugin;
    }

    /**
     * Handles the opening of a preview in the plugin UI.
     * Displays a predefined HTML file in an iframe.
     */
    onOpen(): void {
        const {contentEl} = this;
        contentEl.setText('Preview');
        const pluginPath = this.plugin.manifest.dir
        if (pluginPath) {
            const previewPath = path.join(pluginPath, '/swagger-pet-store-example.html')
            const iframe = this.plugin.openAPI.createIframe({
                htmlPath: previewPath,
                width: this.plugin.settings.iframeWidth,
                height: this.plugin.settings.iframeHeight,
            } as Params)
            contentEl.appendChild(iframe)
            contentEl.show()
        }
    }

    /**
     * Clears the content element upon closing the plugin UI.
     */
    onClose(): void {
        const {contentEl} = this;
        contentEl.empty();
    }
}