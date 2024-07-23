import { App, PluginSettingTab, Setting } from 'obsidian';
import { SettingSectionParams, SettingsSection } from '../typing/interfaces';
import OpenAPIRendererPlugin from '../core/OpenAPIRendererPlugin';
import { OpenAPIRendererEventPublisher } from '../pluginEvents/eventManager';
import UISettings from './UISettings';
import ServerSettings from './serverSettings';
import RenderSettings from './renderSettings';
import SettingsUtils from './utils';
import GeneralSettings from './generalSettings';

export class OpenAPISettingTab extends PluginSettingTab {
    protected publisher: OpenAPIRendererEventPublisher;
    protected plugin: OpenAPIRendererPlugin;
    utils: SettingsUtils;
    tabs: { name: string; section: SettingsSection }[];

    constructor(app: App, plugin: OpenAPIRendererPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        const { publisher } = plugin;
        this.publisher = publisher;
        this.utils = new SettingsUtils(this.app, this.plugin, this.publisher);

        const params: SettingSectionParams = { app, plugin, publisher };

        this.tabs = [
            { name: 'General', section: new GeneralSettings(params, this) },
            { name: 'UI', section: new UISettings(params) },
            { name: 'Render', section: new RenderSettings(params) },
            { name: 'Server', section: new ServerSettings(params) },
        ];
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        const navbar = containerEl.createEl('nav', {
            cls: 'openapi-renderer-settings settings-navbar',
        });

        const contentEl = containerEl.createEl('div', {
            cls: 'openapi-renderer-settings',
        });

        const displaySection = (index: number) => {
            contentEl.empty();
            this.tabs[index].section.display(contentEl);
        };
        let activeTab = 0;

        containerEl.addClass('openapi-renderer-settings');

        this.tabs.forEach((tab, index) => {
            const tabEl = navbar.createEl('div', {
                cls: 'openapi-renderer-settings settings-navbar-tab',
            });
            const tabName = tabEl.createEl('div', {
                cls: 'openapi-renderer-settings settings-navbar-tab-name',
                text: tab.name,
            });
            if (index === activeTab) {
                tabEl.addClass('settings-navbar-tab-active');
            }

            tabEl.addEventListener('click', () => {
                activeTab = index;
                navbar
                    .findAll('.settings-navbar-tab')
                    .forEach((button) =>
                        button.removeClass('settings-navbar-tab-active')
                    );
                tabEl.addClasses([
                    'openapi-renderer-settings',
                    'settings-navbar-tab-active',
                ]);
                displaySection(activeTab);
            });
            displaySection(activeTab); // showing first tab by first open
        });
    }
}
