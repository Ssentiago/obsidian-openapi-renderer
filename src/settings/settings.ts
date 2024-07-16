import {App, PluginSettingTab, Setting} from "obsidian";
import {DEFAULT_SETTINGS_Interface, SettingsSection,} from "../typing/interfaces";
import OpenAPIRendererPlugin from "../main";
import {OpenAPIRendererEventPublisher,} from "../pluginEvents/eventEmitter";
import {ServerSettings} from "./serverSettings";
import {RenderSettings} from "./renderSettings";
import {UISettings} from "./UISettings";

export const DEFAULT_SETTINGS: DEFAULT_SETTINGS_Interface = {
    htmlFileName: 'openapi-spec.html',
    openapiSpecFileName: 'openapi-spec.yaml',
    iframeWidth: '100%',
    iframeHeight: '600px',
    isAutoUpdate: false,
    serverHostName: '127.0.0.1',
    serverPort: 8080,
    isServerAutoStart: false,
    isCreateServerButton: true,
    isCreateCommandButtons: false,
    commandButtonLocation: 'toolbar',
    serverButtonLocation: 'ribbon',
    theme: 'light',
    timeoutUnit: 'milliseconds',
    timeout: 2000
};

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

        new Setting(containerEl)
            .addButton(button => {
                button.setIcon('refresh-ccw')
                    .setTooltip('Reset settings to default', {delay: 100})
                    .onClick(async (cb) => {
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
};

