import {PluginUtils} from "./pluginUtils";
import OpenAPIRendererPlugin from "./OpenAPIRendererPlugin";

export class PluginResourceManager {
    plugin: OpenAPIRendererPlugin
    pluginUtils: PluginUtils

    constructor(plugin: OpenAPIRendererPlugin, pluginUtils: PluginUtils) {
        this.plugin = plugin
        this.pluginUtils = pluginUtils
    }

    async checkResources() {
        if (await this.pluginUtils.isFirstOpenPlugin()) {
            this.plugin.showNotice(
                'This seems to be the first launch of the plugin. Please download the resources in the plugin settings, otherwise it may not work correctly.',
                5000
            );
        } else if (await this.pluginUtils.wasAnUpdate()) {
            if (this.plugin.settings.isResourcesAutoUpdate) {
                await this.plugin.githubClient.downloadAssetsFromLatestRelease()
            } else {
                this.plugin.showNotice(
                    'Plugin update detected. It is recommended to update resources in settings to ensure stable operation.',
                    5000
                );
            }
        }
    }
}