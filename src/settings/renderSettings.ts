import {App, DropdownComponent, Setting, TAbstractFile, TextComponent} from "obsidian";
import OpenAPIRendererPlugin from "../main";
import {OpenAPIRendererEventPublisher} from "../pluginEvents/eventEmitter";
import {PowerOffEvent, SettingsSection} from "../typing/interfaces";
import {PreviewModal} from "./previewModal";

import {eventID} from "../typing/constants";

/**
 * Settings section for configuring the OpenAPI Renderer plugin.
 * Manages settings related to rendering, HTML file generation, iframe dimensions,
 * auto-update behavior on file changes, and timeout settings.
 */
export class RenderSettings implements SettingsSection {
    app: App
    plugin: OpenAPIRendererPlugin
    publisher: OpenAPIRendererEventPublisher
    private modifySpecEvent: ((file: TAbstractFile) => Promise<void>) | null = null;

    constructor(app: App,
                plugin: OpenAPIRendererPlugin,
                publisher: OpenAPIRendererEventPublisher) {
        this.app = app;
        this.plugin = plugin
        this.publisher = publisher
        this.plugin.observer.subscribe(
            this.app.workspace,
            eventID.PowerOff,
            this.onunload.bind(this),
        )
    }


    display(containerEl: HTMLElement) {

        new Setting(containerEl)
            .setName('Rendering settings')
            .setHeading()


        new Setting(containerEl)
            .setName('HTML filename')
            .setDesc('Name of the generated HTML file that will contain the rendered OpenAPI specification.')
            .addText(text => {
                text.setPlaceholder('openapi-spec.html')
                    .setValue(this.plugin.settings.htmlFileName);

                let handler = this.plugin.eventsHandler.handleSettingsTabHTMLFileNameBlur.bind(this.plugin.eventsHandler, text)
                this.plugin.registerDomEvent(text.inputEl, "blur", handler);
            });


        new Setting(containerEl)
            .setName("OpenAPI specification file name")
            .setDesc("The file containing your OpenAPI specification. Must end with .yaml, .yml, or .json")
            .addText((text: TextComponent) => {
                text.setPlaceholder('openapi-spec.yaml')
                    .setValue(this.plugin.settings.openapiSpecFileName)
                let handler = this.plugin.eventsHandler.handleSettingsTabOpenAPISpecBlur.bind(this.plugin.eventsHandler, text)
                this.plugin.registerDomEvent(text.inputEl, 'blur', handler);
            });


        new Setting(containerEl)
            .setName('Iframe dimensions')
            .setDesc('Set the dimensions for the iframe that will display the rendered OpenAPI specification in your notes.')
            .addText(text => {
                text.setPlaceholder('100%')
                    .setValue(this.plugin.settings.iframeWidth);

                let handler = this.plugin.eventsHandler.handleSettingsTabIframeWidthBlur.bind(this.plugin.eventsHandler, text)
                this.plugin.registerDomEvent(text.inputEl, 'blur', handler);
            })
            .addText(text => {
                text.setPlaceholder('600px')
                    .setValue(this.plugin.settings.iframeHeight);
                let handler = this.plugin.eventsHandler.handleSettingsTabIframeHeightBlur.bind(this.plugin.eventsHandler, text)
                this.plugin.registerDomEvent(text.inputEl, 'blur', handler);
            })
            .addExtraButton(button => {
                button.setIcon('info')
                    .setTooltip('Width x Height')
                    .onClick(() => {
                        this.plugin.showNotice('Width and height determine the size of the iframe in your notes. Use CSS units like px, %, or vh.', 5000)
                    });
            }).addButton(button => {
            button.onClick(() => {
                new PreviewModal(this.app, this.plugin).open()
            })
                .setTooltip('Show the preview of the iframe with current settings. Check the server state first', {delay: 100})
                .setIcon('scan-eye')
        });


        new Setting(containerEl)
            .setName('Autoupdate on file change')
            .setDesc('Will the HTML file and iframe preview update automatically when the OpenAPI Spec file changes?')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.isAutoUpdate)
                .onChange(async (value) => {
                    this.plugin.settings.isAutoUpdate = value;
                    await this.plugin.saveSettings();
                    if (value) {
                        this.modifySpecEvent = this.plugin.eventsHandler.modifyOpenAPISPec.bind(this.plugin.eventsHandler);
                        this.plugin.registerEvent(this.app.vault.on('modify', this.modifySpecEvent));
                        this.plugin.showNotice('File modification tracking enabled');
                    } else {
                        if (this.modifySpecEvent) {
                            this.app.vault.off('modify', this.modifySpecEvent);
                            this.modifySpecEvent = null;
                            this.plugin.showNotice('File modification tracking disabled');
                        }
                    }
                }));


        new Setting(containerEl)
            .setName('Timeout of auto-update on file change')
            .setDesc('Enter the timeout in unit you  chosen for auto-update when files are changed.')
            .addText((text: TextComponent) => {
                text.setPlaceholder('2000')
                    .setValue(this.plugin.settings.timeout.toString())

                let handler = this.plugin.eventsHandler.handleSettingsTabTimeoutBlur.bind(this.plugin.eventsHandler, text)
                this.plugin.registerDomEvent(text.inputEl, 'blur', handler)
            })
            .addDropdown((dropdown: DropdownComponent) => {
                dropdown.addOptions({
                    'milliseconds': 'Milliseconds',
                    'seconds': 'Seconds'
                })
                    .setValue(this.plugin.settings.timeoutUnit)
                    .onChange(async (value) => {
                        this.plugin.settings.timeoutUnit = value
                        await this.plugin.saveSettings()
                    })
            })

    }

    /**
     * Asynchronous method called when loading the plugin or handling a PowerOffEvent.
     * If there is a registered modification event for the OpenAPI Spec file, it is unregistered.
     * @param event The PowerOffEvent object.
     */
    private async onunload(event: PowerOffEvent) {
        if (this.modifySpecEvent) {
            this.app.vault.off('modify', this.modifySpecEvent);
            this.modifySpecEvent = null;
        }
    }
}