import OpenAPIRendererPlugin from "../main";
import {OpenAPIRendererEventPublisher} from "../pluginEvents/eventEmitter";
import {App, Setting} from "obsidian";
import {eventID, eventPublisher, REFRESHER_BUTTON_ID, RENDERER_BUTTON_ID, SERVER_BUTTON_ID, Subject} from "../typing/types";
import {ChangeButtonLocationEvent, ToggleButtonVisibilityEvent} from "../typing/interfaces";

export class UISettings {
    app: App;
    plugin: OpenAPIRendererPlugin
    publisher: OpenAPIRendererEventPublisher

    constructor(
        app: App,
        plugin: OpenAPIRendererPlugin,
        publisher: OpenAPIRendererEventPublisher) {
        this.app = app
        this.plugin = plugin
        this.publisher = publisher
    }

    display(containerEl: HTMLElement) {

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

                        commandButtonLocationSetting.setDisabled(!value)
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
}