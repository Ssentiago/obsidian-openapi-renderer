import PluginUtils from './pluginUtils';
import OpenAPIRendererPlugin from './OpenAPIRendererPlugin';

/**
 * Manages resources for the OpenAPI Renderer Plugin.
 *
 * This class handles:
 * - Checking if it's the first time the plugin is launched.
 * - Managing updates and notifying the user.
 *
 */
export default class PluginStateChecker {
    plugin: OpenAPIRendererPlugin;
    pluginUtils: PluginUtils;

    constructor(plugin: OpenAPIRendererPlugin, pluginUtils: PluginUtils) {
        this.plugin = plugin;
        this.pluginUtils = pluginUtils;
    }

    /**
     * Checks and manages plugin resources.
     *
     * This method:
     * - Displays a notice if it's the first launch of the plugin, prompting the user to download resources.
     * - Checks for plugin updates and either downloads updated resources automatically or shows a notice
     *   recommending an update based on user settings.
     *
     * @returns A promise that resolves when the resource check is complete.
     */
    async checkResources(): Promise<void> {
        if (await this.pluginUtils.isFirstOpenPlugin()) {
            this.plugin.showNotice(
                'This seems to be the first launch of the plugin. Please download the resources in the plugin settings, otherwise it may not work correctly.',
                7000
            );
        } else if (await this.pluginUtils.wasAnUpdate()) {
            if (this.plugin.settings.isResourcesAutoUpdate) {
                this.plugin.showNotice(
                    'An update for the plugin has been identified. ' +
                        'Downloading the latest resources. This may take a moment.',
                    4000
                );
                setTimeout(async () => {
                    await this.plugin.githubClient.downloadAssetsFromLatestRelease();
                }, 4000);
            } else {
                this.plugin.showNotice(
                    'Plugin update detected. It is recommended to update resources in settings to ensure stable operation.',
                    5000
                );
            }
        }
    }
}
