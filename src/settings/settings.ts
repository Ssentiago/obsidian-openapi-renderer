import {App, PluginSettingTab, Setting} from "obsidian";
import {SettingSectionParams, SettingsSection} from "../typing/interfaces";
import OpenAPIRendererPlugin from "../core/OpenAPIRendererPlugin";
import {OpenAPIRendererEventPublisher,} from "../pluginEvents/eventEmitter";
import {UISettings} from "./UISettings";
import {ServerSettings} from "./serverSettings";
import {RenderSettings} from "./renderSettings";
import {SettingsUtils} from "./utils";
import {exportType} from "../typing/types";


/**
 * Represents the settings tab for OpenAPI Renderer plugin settings.
 * Extends PluginSettingTab to handle display and management of plugin settings sections.
 */
export class OpenAPISettingTab extends PluginSettingTab {
    protected publisher: OpenAPIRendererEventPublisher
    protected plugin: OpenAPIRendererPlugin
    utils: SettingsUtils
    sections: SettingsSection[] = [];

    constructor(app: App,
                plugin: OpenAPIRendererPlugin) {
        super(app, plugin);
        this.plugin = plugin
        const {publisher} =  plugin
        this.publisher = publisher
        this.utils = new SettingsUtils(this.app, this.plugin, this.publisher)

        const params: SettingSectionParams = {app, plugin, publisher}

        this.sections = [
            new ServerSettings(params),
            new RenderSettings(params),
            new UISettings(params)
        ]
    }


    display(): void {
        const {containerEl} = this;
        containerEl.empty();
        containerEl.addClass('openapi-renderer-settings');

        new Setting(containerEl)
            .addButton(button => {
                button.setIcon('refresh-ccw')
                    .setTooltip('Reset settings to default', {delay: 100})
                    .onClick(async () => {
                        try {
                            await this.plugin.settingsManager.resetSettings()
                            this.plugin.showNotice('Settings have been reset to default')
                            setTimeout(() => {
                                this.display()
                            }, 100)
                        } catch (e: any) {
                            this.plugin.logger.error(e.message)
                        }
                    })
            });

        new Setting(containerEl)
            .addButton(button => {
                button.setIcon('github')
                    .setTooltip('Download plugin`s assets from Github release')
                    .onClick(async (cb) => {
                        await this.plugin.githubClient.downloadAssetsFromLatestRelease()
                    })
            })

        new Setting(containerEl)
            .setName('Resources autoupdate')
            .setDesc('Automatically download plugin assets from GitHub releases?')
            .addToggle(toggle => {
                toggle.setValue(this.plugin.settings.isResourcesAutoUpdate)
                    .onChange(async (value) => {
                        this.plugin.settings.isResourcesAutoUpdate = value
                       await this.plugin.settingsManager.saveSettings()
                    })
            })

        this.utils.createLinkedComponents({
            containerEl: containerEl,
            name: 'Default export option',
            desc: 'What export format would you like to use by default?',
            type: 'dropdown',
            options: {
                'none': 'None',
                'cdn': 'CDN',
                'all-in-the-one': 'All-in-the-one',
                'zip': 'ZIP'
            },
            setValue: this.plugin.settings.exportType,
            tooltips: {
                'none': 'A modal window will appear each time you export, allowing you to choose the export option.',
                'all-in-the-one': 'Includes all resources, such as code and CSS, ' +
                    'embedded directly into the HTML file. Ideal for offline use, ' +
                    'though the file size will be larger.',
                'zip': 'Exports all files and assets in a ZIP archive, e' +
                    'nsuring that all resources are included without external dependencies.',
                'cdn': 'The HTML file will link to external CDN resources. ' +
                    'This keeps the file size small but requires an internet ' +
                    'connection to access resources.'
            },
            onChange: async (value) => {
                this.plugin.settings.exportType = value as exportType
                await this.plugin.settingsManager.saveSettings()
            }
        });

        for (const section of this.sections) {
            section.display(containerEl)
        }


    }
}

