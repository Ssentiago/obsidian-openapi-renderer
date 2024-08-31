import { App, Setting } from 'obsidian';
import React, { useEffect } from 'react';
import OpenAPIRendererPlugin from '../../../core/OpenAPIRendererPlugin';
import { eventID, eventPublisher, Subject } from '../../../typing/constants';
import { SettingsTabStateEvent } from '../../../typing/interfaces';
import SettingsUtils from '../../utils';
import { SettingsContainer } from '../container-styled-component';
import { useSettingsContext } from '../core/context';

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
        }
    }, [ref]);

    return (
        <SettingsContainer className={'openapi-renderer-settings'} ref={ref} />
    );
};

export default GeneralSectionComponent;
