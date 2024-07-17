import {App, PluginSettingTab, Setting} from "obsidian";
import {SettingsSection} from "../typing/interfaces";
import OpenAPIRendererPlugin from "../main";
import {OpenAPIRendererEventPublisher,} from "../pluginEvents/eventEmitter";
import {UISettings} from "./UISettings";
import {ServerSettings} from "./serverSettings";
import {RenderSettings} from "./renderSettings";




/**
 * Represents the settings tab for OpenAPI Renderer plugin settings.
 * Extends PluginSettingTab to handle display and management of plugin settings sections.
 */
export class OpenAPISettingTab extends PluginSettingTab {
    protected publisher: OpenAPIRendererEventPublisher
    protected plugin: OpenAPIRendererPlugin
    sections: SettingsSection[] = [];

    constructor(app: App,
                plugin: OpenAPIRendererPlugin,
                publisher: OpenAPIRendererEventPublisher) {
        super(app, plugin);
        this.plugin = plugin
        this.publisher = publisher

        const params = {app, plugin, publisher}

        this.sections = [
            new ServerSettings(params.app, params.plugin, params.publisher),
            new RenderSettings(params.app, params.plugin, params.publisher),
            new UISettings(params.app, params.plugin, params.publisher)
        ]
    }


    display() {
        const {containerEl} = this;
        containerEl.empty();
        containerEl.addClass('openapi-renderer-settings');

        new Setting(containerEl)
            .addButton(button => {
                button.setIcon('refresh-ccw')
                    .setTooltip('Reset settings to default', {delay: 100})
                    .onClick(async () => {
                        try {
                            await this.plugin.resetSettings()
                            this.plugin.showNotice('Settings have been reset to default')
                            setTimeout(() => {
                                this.display()
                            }, 100)
                        } catch (e: any) {
                            this.plugin.logger.error(e.message)
                        }
                    })
            });

        for (const section of this.sections) {
            section.display(containerEl)
        }


    }
}

