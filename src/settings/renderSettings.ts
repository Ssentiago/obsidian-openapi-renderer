import {
    App,
    DropdownComponent,
    Setting,
    TAbstractFile,
    TextComponent,
} from 'obsidian';
import OpenAPIRendererPlugin from '../core/OpenAPIRendererPlugin';
import { OpenAPIRendererEventPublisher } from '../pluginEvents/eventEmitter';
import {
    PowerOffEvent,
    SettingSectionParams,
    SettingsSection,
} from '../typing/interfaces';

import { eventID } from '../typing/constants';
import SettingsUtils from './utils';

/**
 * Class representing the settings section of the OpenAPI Renderer plugin.
 * Implements the `SettingsSection` interface to manage plugin-specific settings in the settings UI.
 */
export default class RenderSettings implements SettingsSection {
    app: App;
    plugin: OpenAPIRendererPlugin;
    publisher: OpenAPIRendererEventPublisher;
    private modifySpecEvent: ((file: TAbstractFile) => Promise<void>) | null =
        null;
    utils: SettingsUtils;

    constructor({ app, plugin, publisher }: SettingSectionParams) {
        this.app = app;
        this.plugin = plugin;
        this.publisher = publisher;
        this.plugin.observer.subscribe(
            this.app.workspace,
            eventID.PowerOff,
            this.onunload.bind(this)
        );
        this.utils = new SettingsUtils(this.app, this.plugin, this.publisher);
    }

    /**
     * Displays the settings UI for the plugin in the given container element.
     * This method sets up various settings related to the OpenAPI specification and iframe rendering
     *
     * @param {HTMLElement} containerEl - The HTML element where the settings UI will be rendered.
     * @returns {void}
     */
    display(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName('OpenAPI specification file name')
            .setDesc(
                'Specify the filename of your OpenAPI specification. Ensure it ends with .yaml, .yml, or .json.'
            )
            .addText((text: TextComponent) => {
                text.setPlaceholder('openapi-spec.yaml').setValue(
                    this.plugin.settings.openapiSpecFileName
                );
                const handler =
                    this.plugin.eventsHandler.handleSettingsTabOpenAPISpecBlur.bind(
                        this.plugin.eventsHandler,
                        text
                    );
                this.plugin.registerDomEvent(text.inputEl, 'blur', handler);
            });

        new Setting(containerEl)
            .setName('Iframe dimensions')
            .setDesc(
                'Define the width and height for the iframe that will display the rendered OpenAPI specification within your notes. ' +
                    'Use CSS units like px, %, or just numbers for pixels'
            )
            .addText((text) => {
                text.setPlaceholder('100%').setValue(
                    this.plugin.settings.iframeWidth
                );

                const handler =
                    this.plugin.eventsHandler.handleSettingsTabIframeWidthBlur.bind(
                        this.plugin.eventsHandler,
                        text
                    );
                this.plugin.registerDomEvent(text.inputEl, 'blur', handler);
            })
            .addText((text) => {
                text.setPlaceholder('600px').setValue(
                    this.plugin.settings.iframeHeight
                );
                const handler =
                    this.plugin.eventsHandler.handleSettingsTabIframeHeightBlur.bind(
                        this.plugin.eventsHandler,
                        text
                    );
                this.plugin.registerDomEvent(text.inputEl, 'blur', handler);
            })
            .addExtraButton((button) => {
                button
                    .setIcon('info')
                    .setTooltip('Width x Height')
                    .onClick(() => {
                        this.plugin.showNotice(
                            'Width and height determine the size of the iframe in your notes. Use CSS units like px, %, or vh.',
                            5000
                        );
                    });
            });

        new Setting(containerEl)
            .setName('Enable auto-update on file change')
            .setDesc(
                'Automatically update the HTML file and iframe preview when the OpenAPI specification file changes?'
            )
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.isHTMLAutoUpdate)
                    .onChange(async (value) => {
                        this.plugin.settings.isHTMLAutoUpdate = value;
                        await this.plugin.settingsManager.saveSettings();
                        if (value) {
                            this.modifySpecEvent =
                                this.plugin.eventsHandler.modifyOpenAPISPec.bind(
                                    this.plugin.eventsHandler
                                );
                            this.plugin.registerEvent(
                                this.app.vault.on(
                                    'modify',
                                    this.modifySpecEvent
                                )
                            );
                            this.plugin.showNotice(
                                'File modification tracking enabled'
                            );
                        } else {
                            if (this.modifySpecEvent) {
                                this.app.vault.off(
                                    'modify',
                                    this.modifySpecEvent
                                );
                                this.modifySpecEvent = null;
                                this.plugin.showNotice(
                                    'File modification tracking disabled'
                                );
                            }
                        }
                    })
            );

        new Setting(containerEl)
            .setName('Timeout of autoupdate on file change')
            .setDesc(
                'Specify the timeout duration for auto-updating the HTML file and iframe preview after the OpenAPI specification file changes.' +
                    ' Set the duration in milliseconds or seconds.'
            )
            .addText((text: TextComponent) => {
                text.setPlaceholder('2000').setValue(
                    this.plugin.settings.timeout.toString()
                );

                const handler =
                    this.plugin.eventsHandler.handleSettingsTabTimeoutBlur.bind(
                        this.plugin.eventsHandler,
                        text
                    );
                this.plugin.registerDomEvent(text.inputEl, 'blur', handler);
            })
            .addDropdown((dropdown: DropdownComponent) => {
                dropdown
                    .addOptions({
                        milliseconds: 'Milliseconds',
                        seconds: 'Seconds',
                    })
                    .setValue(this.plugin.settings.timeoutUnit)
                    .onChange(async (value) => {
                        this.plugin.settings.timeoutUnit = value;
                        await this.plugin.settingsManager.saveSettings();
                    });
            });
    }

    /**
     * Asynchronous method called when loading the plugin or handling a PowerOffEvent.
     * If there is a registered modification event for the OpenAPI Spec file, it is unregistered.
     * @param event The PowerOffEvent object.
     */
    private async onunload(event: PowerOffEvent): Promise<void> {
        if (this.modifySpecEvent) {
            this.app.vault.off('modify', this.modifySpecEvent);
            this.modifySpecEvent = null;
        }
    }
}
