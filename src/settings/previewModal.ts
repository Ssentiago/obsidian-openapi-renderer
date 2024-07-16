import {App, Modal} from "obsidian";
import OpenAPIRendererPlugin from "../main";
import path from "path";
import {Params} from "../typing/interfaces";

export class PreviewModal extends Modal {
    plugin: OpenAPIRendererPlugin

    constructor(app: App, plugin: OpenAPIRendererPlugin) {
        super(app);
        this.plugin = plugin;
    }

    onOpen() {
        let {contentEl} = this;
        contentEl.setText('Preview');
        const serverAddress = this.plugin.server.serverAddress
        if (serverAddress) {
            const previewPath = path.join(this.plugin.manifest.dir + '/assets/swagger-petstore-example.html')
            if (previewPath) {
                const iframe = this.plugin.openAPI.createIframe({
                    htmlPath: previewPath,
                    width: this.plugin.settings.iframeWidth,
                    height: this.plugin.settings.iframeHeight,
                } as Params)
                contentEl.appendChild(iframe)
                contentEl.show()
            }
        }

    }

    onClose() {
        let {contentEl} = this;
        contentEl.empty();
    }
}