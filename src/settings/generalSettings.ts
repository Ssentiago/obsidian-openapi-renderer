import {
    SettingSectionParams,
    SettingsSection,
    SettingsTabStateEvent,
} from '../typing/interfaces';
import SettingsUtils from './utils';
import { App, Setting } from 'obsidian';
import OpenAPIRendererPlugin from '../core/OpenAPIRendererPlugin';
import { OpenAPIRendererEventPublisher } from '../pluginEvents/eventManager';
import { exportType } from '../typing/types';
import { eventID, eventPublisher, Subject } from '../typing/constants';

export default class GeneralSettings implements SettingsSection {
    app: App;
    plugin: OpenAPIRendererPlugin;
    publisher: OpenAPIRendererEventPublisher;
    utils: SettingsUtils;

    constructor({ app, plugin, publisher }: SettingSectionParams) {
        this.app = app;
        this.plugin = plugin;
        this.publisher = publisher;
        this.utils = new SettingsUtils(this.app, this.plugin, this.publisher);
    }

    display(containerEl: HTMLElement): void {
        const { settings } = this.plugin;

        new Setting(containerEl).addButton((button) => {
            button
                .setIcon('refresh-ccw')
                .setTooltip('Reset settings to default', { delay: 100 })
                .onClick(async () => {
                    try {
                        await this.plugin.settingsManager.resetSettings();
                        this.plugin.showNotice(
                            'Settings have been reset to default'
                        );
                        setTimeout(() => {
                            this.plugin.publisher.publish({
                                eventID: eventID.SettingsTabState,
                                publisher: eventPublisher.Settings,
                                subject: Subject.Settings,
                                timestamp: new Date(),
                                emitter: this.app.workspace,
                            } as SettingsTabStateEvent);
                        }, 100);
                    } catch (e: any) {
                        this.plugin.showNotice(
                            'Something went wrong. Maybe check the logs?'
                        );
                        this.plugin.logger.error(e.message);
                    }
                });
        });

        new Setting(containerEl).addButton((button) => {
            button
                .setIcon('github')
                .setTooltip('Download plugin`s assets from Github release')
                .onClick(async (cb) => {
                    await this.plugin.githubClient.downloadAssetsFromLatestRelease();
                });
        });

        new Setting(containerEl)
            .setName('Resources autoupdate')
            .setDesc(
                'Automatically download plugin assets from GitHub releases after each plugin update?'
            )
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.isResourcesAutoUpdate)
                    .onChange(async (value) => {
                        this.plugin.settings.isResourcesAutoUpdate = value;
                        await this.plugin.settingsManager.saveSettings();
                    });
            });
        this.utils.createLinkedComponents({
            containerEl: containerEl,
            name: 'Default export option',
            desc: 'What export format would you like to use by default?',
            type: 'dropdown',
            options: {
                none: 'None',
                cdn: 'CDN',
                'all-in-the-one': 'All-in-the-one',
                zip: 'ZIP',
            },
            setValue: this.plugin.settings.exportType,
            tooltips: {
                none: 'A modal window will appear each time you export, allowing you to choose the export option.',
                'all-in-the-one':
                    'Includes all resources, such as code and CSS, ' +
                    'embedded directly into the HTML file. Ideal for offline use, ' +
                    'though the file size will be larger.',
                zip:
                    'Exports all files and assets in a ZIP archive, ' +
                    'ensuring that all resources are included without external dependencies.',
                cdn:
                    'The HTML file will link to external CDN resources. ' +
                    'This keeps the file size small but requires an internet ' +
                    'connection to access resources.',
            },
            onChange: async (value) => {
                this.plugin.settings.exportType = value as exportType;
                await this.plugin.settingsManager.saveSettings();
            },
        });
    }
}
