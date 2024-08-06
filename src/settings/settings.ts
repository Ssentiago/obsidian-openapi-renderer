import { App, PluginSettingTab } from 'obsidian';
import { SettingSectionParams, SettingsSection } from '../typing/interfaces';
import OpenAPIRendererPlugin from '../core/OpenAPIRendererPlugin';
import { OpenAPIRendererEventPublisher } from '../pluginEvents/eventManager';
import ServerSettings from './serverSettings';
import SettingsUtils from './utils';
import GeneralSettings from './generalSettings';
import { EditorSettings } from './editorSettings';
import { PreviewSettings } from './preview-settings';

export class OpenAPISettingTab extends PluginSettingTab {
    utils: SettingsUtils;
    tabs: { name: string; section: SettingsSection }[];
    protected publisher: OpenAPIRendererEventPublisher;
    protected plugin: OpenAPIRendererPlugin;

    constructor(app: App, plugin: OpenAPIRendererPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        const { publisher } = plugin;
        this.publisher = publisher;
        this.utils = new SettingsUtils(this.app, this.plugin, this.publisher);

        const params: SettingSectionParams = { app, plugin, publisher };

        this.tabs = [
            { name: 'General', section: new GeneralSettings(params, this, 0) },
            { name: 'Server', section: new ServerSettings(params, 3) },
            { name: 'Source', section: new EditorSettings(params) },
            { name: 'Preview', section: new PreviewSettings(params) },
        ];
    }

    display(activeTabNumber: number | undefined = undefined): void {
        const { containerEl } = this;
        containerEl.empty();
        const navbar = containerEl.createEl('nav', {
            cls: 'openapi-renderer-settings settings-navbar',
        });

        const contentEl = containerEl.createEl('div', {
            cls: 'openapi-renderer-settings',
        });

        const displaySection = (index: number): void => {
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
            if (index === (activeTabNumber ?? activeTab)) {
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
            displaySection(activeTabNumber ?? activeTab);
        });
    }
}
