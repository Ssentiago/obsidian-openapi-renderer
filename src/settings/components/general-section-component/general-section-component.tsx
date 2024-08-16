import React, { useEffect } from 'react';
import { useSettingsContext } from '../core/context';
import { App, Setting } from 'obsidian';
import { eventID, eventPublisher, Subject } from '../../../typing/constants';
import { SettingsTabStateEvent } from '../../../typing/interfaces';
import { exportType } from '../../../typing/types';
import OpenAPIRendererPlugin from '../../../core/OpenAPIRendererPlugin';
import SettingsUtils from '../../utils';
import { SettingsContainer } from '../container-styled-component';

const GeneralSectionComponent: React.FC<{
    app: App;
    plugin: OpenAPIRendererPlugin;
}> = ({ app, plugin }) => {
    const { ref } = useSettingsContext();

    useEffect(() => {
        if (ref.current) {
            const containerEl = ref.current as HTMLElement;
            const utils = new SettingsUtils(app, plugin, plugin.publisher);

            new Setting(containerEl)
                .setName('Reset settings to default')
                .addButton((button) => {
                    button.setIcon('refresh-ccw').onClick(async () => {
                        try {
                            await plugin.settingsManager.resetSettings();
                            plugin.showNotice(
                                'Settings have been reset to default'
                            );
                            setTimeout(() => {
                                plugin.publisher.publish({
                                    eventID: eventID.SettingsTabState,
                                    publisher: eventPublisher.Settings,
                                    subject: Subject.Settings,
                                    timestamp: new Date(),
                                    emitter: app.workspace,
                                } as SettingsTabStateEvent);
                            }, 100);
                        } catch (e: any) {
                            plugin.showNotice(
                                'Something went wrong. Maybe check the logs?'
                            );
                            plugin.logger.error(e.message);
                        }
                    });
                });

            new Setting(containerEl)
                .setName('Download plugin`s assets from Github release')
                .addButton((button) => {
                    button
                        .setIcon('github')
                        .onClick(async (cb): Promise<void> => {
                            await plugin.githubClient.downloadAssetsFromLatestRelease();
                        });
                });

            new Setting(containerEl)
                .setName('Resources autoupdate')
                .setDesc(
                    'Automatically download plugin assets from GitHub releases after each plugin update?'
                )
                .addToggle((toggle) => {
                    toggle
                        .setValue(plugin.settings.isResourcesAutoUpdate)
                        .onChange(async (value) => {
                            plugin.settings.isResourcesAutoUpdate = value;
                            await plugin.settingsManager.saveSettings();
                        });
                });

            utils.createLinkedComponents({
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
                setValue: plugin.settings.exportType,
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
                    plugin.settings.exportType = value as exportType;
                    await plugin.settingsManager.saveSettings();
                },
            });
        }
    }, [ref]);

    return (
        <SettingsContainer className={'openapi-renderer-settings'} ref={ref} />
    );
};

export default GeneralSectionComponent;
