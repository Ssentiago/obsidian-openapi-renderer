import {App, DropdownComponent, Modal, PluginSettingTab, Setting, TAbstractFile, TextComponent} from "obsidian";
import {ChangeButtonLocationEvent, DEFAULT_SETTINGS_Interface, Params, ToggleButtonVisibilityEvent,} from "./typing/interfaces";
import OpenAPIRendererPlugin from "./main";
import {OpenAPIRendererEventPublisher,} from "./pluginEvents/eventEmitter";
import {eventID, eventPublisher, REFRESHER_BUTTON_ID, RENDERER_BUTTON_ID, SERVER_BUTTON_ID, Subject} from "./typing/types";
import path from "path";

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
    private modifySpecEvent: ((file: TAbstractFile) => Promise<void>) | null = null;
    publisher: OpenAPIRendererEventPublisher

    constructor(app: App, private plugin: OpenAPIRendererPlugin, publisher: OpenAPIRendererEventPublisher) {
        super(app, plugin);
        this.publisher = publisher
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
            })

        new Setting(containerEl)
            .setName('Server settings')
            .setHeading()

        new Setting(containerEl)
            .setName('Server Status')
            .setDesc('Check if the server is running')
            .addButton(button => {
                const updateButtonState = () => {
                    if (this.plugin.server.isRunning()) {
                        button.setIcon('check-circle').setTooltip('Server is running');
                    } else {
                        button.setIcon('x-circle').setTooltip('Server is not running');
                    }
                };

                updateButtonState();

                button.onClick(async () => {
                    if (this.plugin.server.isRunning()) {
                        this.plugin.showNotice('Pong! Server is running.');
                    } else {
                        const startServer = await this.plugin.server.start();
                        if (startServer) {
                            this.plugin.showNotice('Server started successfully!');
                        } else {
                            this.plugin.showNotice('Failed to start server. Check logs for details.');
                        }
                    }
                    updateButtonState();
                });
            });
        new Setting(containerEl)
            .setName('Autostart server')
            .setDesc('Will the server automatically start when the app is opened?')
            .addToggle((toggle) => toggle
                .setValue(this.plugin.settings.isServerAutoStart)
                .onChange(async (value) => {
                    this.plugin.settings.isServerAutoStart = value;
                    await this.plugin.saveSettings()
                })
            );

        new Setting(containerEl)
            .setName('Server listening port')
            .setDesc('The port number on which the OpenAPI Renderer server will listen for connections.')
            .addText(text => {
                    text.setPlaceholder('8080')
                        .setValue(this.plugin.settings.serverPort.toString())

                    let handler = this.plugin.eventsHandler.settingsTabServerPortBlur.bind(this.plugin.eventsHandler, text)
                    this.plugin.registerDomEvent(text.inputEl, 'blur', handler);
                    text.inputEl.id = 'openapi-input-port'
                }
            ).addExtraButton(button => {
            button.setIcon('info')
                .setTooltip('Valid port numbers are between 1024 and 65535', {delay: 100})
        })

        new Setting(containerEl)
            .setName('Rendering settings')
            .setHeading()


        new Setting(containerEl)
            .setName('HTML filename')
            .setDesc('Name of the generated HTML file that will contain the rendered OpenAPI specification.')
            .addText(text => {
                text.setPlaceholder('openapi-spec.html')
                    .setValue(this.plugin.settings.htmlFileName);

                let handler = this.plugin.eventsHandler.settingsTabInputHtmlBlur.bind(this.plugin.eventsHandler, text)
                this.plugin.registerDomEvent(text.inputEl, "blur", handler);
            });


        new Setting(containerEl)
            .setName("OpenAPI specification file name")
            .setDesc("The file containing your OpenAPI specification. Must end with .yaml, .yml, or .json")
            .addText((text: TextComponent) => {
                text.setPlaceholder('openapi-spec.yaml')
                    .setValue(this.plugin.settings.openapiSpecFileName)
                let handler = this.plugin.eventsHandler.settingsTabInputIframeBlur.bind(this.plugin.eventsHandler, text)
                this.plugin.registerDomEvent(text.inputEl, 'blur', handler);
            });


        new Setting(containerEl)
            .setName('Iframe dimensions')
            .setDesc('Set the dimensions for the iframe that will display the rendered OpenAPI specification in your notes.')
            .addText(text => {
                text.setPlaceholder('100%')
                    .setValue(this.plugin.settings.iframeWidth);

                let handler = this.plugin.eventsHandler.settingsTabInputIframeWidthBlur.bind(this.plugin.eventsHandler, text)
                this.plugin.registerDomEvent(text.inputEl, 'blur', handler);
            })
            .addText(text => {
                text.setPlaceholder('600px')
                    .setValue(this.plugin.settings.iframeHeight);
                let handler = this.plugin.eventsHandler.settingsTabInputIframeHeightBlur.bind(this.plugin.eventsHandler, text)
                this.plugin.registerDomEvent(text.inputEl, 'blur', handler);
            })
            .addExtraButton(button => {
                button.setIcon('info')
                    .setTooltip('Width x Height')
                    .onClick(() => {
                        this.plugin.showNotice('Width and height determine the size of the iframe in your notes. Use CSS units like px, %, or vh.', 5000)
                    });
            }).addButton(button => {
            button.onClick(cb => {
                new PreviewModal(this.app, this.plugin).open()
                // todo preview swagger petstore in assets
            }).setTooltip('Show the preview of the iframe with current settings. Check the server state first', {delay: 100})
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

                let handler = this.plugin.eventsHandler.settingsTabTimeoutInput.bind(this.plugin.eventsHandler, text)
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


        new Setting(containerEl)
            .setName('UI Customization')
            .setHeading()


        // new obsidian.Setting(containerEl)
        //     .setName('Theme')
        //     .setDesc('Select the theme for Swagger UI')
        //     .addDropdown(dropdown => dropdown
        //         .addOptions({
        //             'light': 'Light',
        //             'dark': 'Dark'
        //         })
        //         .setValue(this.plugin.settings.theme)
        //         .onChange(async (value) => {
        //             this.plugin.settings.theme = value;
        //             await this.plugin.settingsHandler.saveSettings();
        //         }));
        // ;

        new Setting(containerEl)
            .setName('Start server button')
            .setDesc('Add a button for quick access to start the OpenAPI Renderer server?')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.isCreateServerButton)
                .onChange(async (value) => {
                        this.plugin.settings.isCreateServerButton = value;
                        await this.plugin.saveSettings();
                        const event = {
                            eventID: eventID.ToggleButtonVisibility,
                            timestamp: new Date(),
                            publisher: eventPublisher.Settings,
                            subject: Subject.Button,
                            emitter: this.app.workspace,
                            data: {
                                buttonID: SERVER_BUTTON_ID,
                                location: this.plugin.settings.serverButtonLocation,
                            }
                        } as ToggleButtonVisibilityEvent;
                        this.publisher.publish(event)


                        serverButtonLocationSetting.setDisabled(!value)
                    }
                )
            );

        const serverButtonLocationSetting = new Setting(containerEl)
            .setName('Server button location')
            .setDesc('What location of button do you like?')
            .addDropdown((dropdown) => {
                    dropdown.addOptions(
                        {
                            'ribbon': 'Ribbon',
                            'toolbar': 'ToolBar',
                            'statusbar': 'StatusBar',
                        }
                    )
                        .setValue(this.plugin.settings.serverButtonLocation)
                        .onChange(async (value) => {
                            const oldValue = this.plugin.settings.serverButtonLocation;
                            this.plugin.settings.serverButtonLocation = value;
                            await this.plugin.saveSettings()
                            const event = {
                                eventID: eventID.ChangeButtonLocation,
                                timestamp: new Date(),
                                publisher: eventPublisher.Settings,
                                subject: Subject.Button,
                                emitter: this.app.workspace,
                                data: {
                                    buttonID: SERVER_BUTTON_ID,
                                    location: this.plugin.settings.serverButtonLocation,
                                    oldLocation: oldValue
                                }
                            } as ChangeButtonLocationEvent;
                            this.publisher.publish(event)
                        })
                }
            )

        new Setting(containerEl)
            .setName('Command buttons')
            .setDesc('Add buttons for OpenAPI Renderer commands in the Obsidian interface?')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.isCreateCommandButtons)
                .onChange(async (value) => {
                        this.plugin.settings.isCreateCommandButtons = value;
                        await this.plugin.saveSettings()

                        const renderButtonEvent = {
                            eventID: eventID.ToggleButtonVisibility,
                            timestamp: new Date(),
                            publisher: eventPublisher.Settings,
                            subject: Subject.Button,
                            emitter: this.app.workspace,
                            data: {
                                buttonID: RENDERER_BUTTON_ID,
                                location: this.plugin.settings.commandButtonLocation,
                            }
                        } as ToggleButtonVisibilityEvent;

                        const refreshButtonEvent = {
                            eventID: eventID.ToggleButtonVisibility,
                            timestamp: new Date(),
                            publisher: eventPublisher.Settings,
                            subject: Subject.Button,
                            emitter: this.app.workspace,
                            data: {
                                buttonID: REFRESHER_BUTTON_ID,
                                location: this.plugin.settings.commandButtonLocation,
                            }
                        } as ToggleButtonVisibilityEvent

                        this.publisher.publish(renderButtonEvent)
                        this.publisher.publish(refreshButtonEvent)

                        serverButtonLocationSetting.setDisabled(!value)
                    }
                )
            )

        const commandButtonLocationSetting = new Setting(containerEl)
            .setName('Command buttons location')
            .setDesc('What location of buttons do you like?')
            .addDropdown((dropdown) => {
                    dropdown.addOptions(
                        {
                            'ribbon': 'Ribbon',
                            'toolbar': 'Toolbar',
                            'statusbar': 'StatusBar',
                        }
                    )
                        .setValue(this.plugin.settings.commandButtonLocation)
                        .onChange(async (value) => {
                                const oldValue = this.plugin.settings.commandButtonLocation
                                this.plugin.settings.commandButtonLocation = value;
                                await this.plugin.saveSettings()

                                const renderButtonEvent = {
                                    eventID: eventID.ChangeButtonLocation,
                                    timestamp: new Date(),
                                    publisher: eventPublisher.Settings,
                                    subject: Subject.Button,
                                    emitter: this.app.workspace,
                                    data: {
                                        buttonID: RENDERER_BUTTON_ID,
                                        location: this.plugin.settings.commandButtonLocation,
                                        oldLocation: oldValue
                                    }
                                } as ChangeButtonLocationEvent

                                const refreshButtonEvent = {
                                    eventID: eventID.ChangeButtonLocation,
                                    timestamp: new Date(),
                                    publisher: eventPublisher.Settings,
                                    subject: Subject.Button,
                                    emitter: this.app.workspace,
                                    data: {
                                        buttonID: REFRESHER_BUTTON_ID,
                                        location: this.plugin.settings.commandButtonLocation,
                                        oldLocation: oldValue
                                    }
                                } as ChangeButtonLocationEvent
                                this.publisher.publish(renderButtonEvent)
                                this.publisher.publish(refreshButtonEvent)
                            }
                        );
                }
            )

        serverButtonLocationSetting.setDisabled(!this.plugin.settings.isCreateServerButton)
        commandButtonLocationSetting.setDisabled(!this.plugin.settings.isCreateCommandButtons)

    }
};

class PreviewModal extends Modal {
    plugin: OpenAPIRendererPlugin

    constructor(app: App, plugin: OpenAPIRendererPlugin) {
        super(app);
        this.plugin = plugin;
    }

    onOpen() {
        let {contentEl} = this;
        contentEl.setText('Preview');
        const serverAddress = this.plugin.server.serverAddress
        if (serverAddress) {
            const previewPath = path.join(this.plugin.manifest.dir + '/assets/swagger-petstore-example.html')
            if (previewPath) {
                const iframe = this.plugin.openAPI.createIframe({
                    htmlPath: previewPath,
                    width: this.plugin.settings.iframeWidth,
                    height: this.plugin.settings.iframeHeight,
                } as Params)
                contentEl.appendChild(iframe)
                contentEl.show()
            }
        }

    }

    onClose() {
        let {contentEl} = this;
        contentEl.empty();
    }
}