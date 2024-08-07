import { App, PluginSettingTab } from 'obsidian';
import { SettingSectionParams, SettingsSection } from '../typing/interfaces';
import OpenAPIRendererPlugin from '../core/OpenAPIRendererPlugin';
import { OpenAPIRendererEventPublisher } from '../pluginEvents/eventManager';
import ServerSettings from './serverSettings';
import SettingsUtils from './utils';
import GeneralSettings from './generalSettings';
import { SourceSettings } from './source-settings';
import { PreviewSettings } from './preview-settings';
import { eventID } from '../typing/constants';

export class OpenAPISettingTab extends PluginSettingTab {
    utils: SettingsUtils;
    tabs: Map<string, SettingsSection>;
    activeTab: string;
    protected publisher: OpenAPIRendererEventPublisher;
    protected plugin: OpenAPIRendererPlugin;

    constructor(app: App, plugin: OpenAPIRendererPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        const { publisher } = plugin;
        this.publisher = publisher;
        this.utils = new SettingsUtils(this.app, this.plugin, this.publisher);

        const params: SettingSectionParams = { app, plugin, publisher };

        this.tabs = new Map([
            ['General', new GeneralSettings(params)],
            ['Server', new ServerSettings(params)],
            ['Source', new SourceSettings(params)],
            ['Preview', new PreviewSettings(params)],
        ]);
        this.activeTab = 'General';
        this.plugin.observer.subscribe(
            this.app.workspace,
            eventID.SettingsTabState,
            async () => {
                this.display();
            }
        );
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

        const displaySection = (key: string): void => {
            contentEl.empty();
            const tab = this.tabs.get(key);
            if (tab) {
                tab.display(contentEl);
            }
        };

        containerEl.addClass('openapi-renderer-settings');

        this.tabs.forEach((tab, key) => {
            const tabEl = navbar.createEl('div', {
                cls: 'openapi-renderer-settings settings-navbar-tab',
            });
            const tabName = tabEl.createEl('div', {
                cls: 'openapi-renderer-settings settings-navbar-tab-name',
                text: key,
            });
            if (key === this.activeTab) {
                tabEl.addClass('settings-navbar-tab-active');
            }

            tabEl.addEventListener('click', (event: MouseEvent) => {
                const tab = tabName.textContent;
                if (!tab) {
                    return;
                }
                this.activeTab = tab;
                navbar
                    .findAll('.settings-navbar-tab')
                    .forEach((button) =>
                        button.removeClass('settings-navbar-tab-active')
                    );
                tabEl.addClasses([
                    'openapi-renderer-settings',
                    'settings-navbar-tab-active',
                ]);
                displaySection(this.activeTab);
            });
        });
        displaySection(this.activeTab);
    }
}
