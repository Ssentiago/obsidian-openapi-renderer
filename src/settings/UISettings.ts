import OpenAPIRendererPlugin from "../main";
import {OpenAPIRendererEventPublisher} from "../pluginEvents/eventEmitter";
import {App, Setting} from "obsidian";
import {SettingsUtils} from "./utils";
import {ButtonLocation, REFRESHER_BUTTON_ID, RENDERER_BUTTON_ID, SERVER_BUTTON_ID} from "../typing/constants";
import {SettingSectionParams} from "../typing/interfaces";


/**
 * Represents the UI settings section within the OpenAPI Renderer plugin settings.
 * Allows users to customize UI elements such as server start buttons and command buttons.
 */
export class UISettings {
    app: App;
    plugin: OpenAPIRendererPlugin
    publisher: OpenAPIRendererEventPublisher
    utils: SettingsUtils

    constructor({app, plugin, publisher}: SettingSectionParams) {
        this.app = app
        this.plugin = plugin
        this.publisher = publisher
        this.utils = new SettingsUtils(this.app, this.plugin, this.publisher)
    }

    display(containerEl: HTMLElement): void {
        const {settings} = this.plugin

        new Setting(containerEl)
            .setName('UI customization')
            .setHeading()

        new Setting(containerEl)
            .setName('Start server button')
            .setDesc('Add a button for quick access to start the OpenAPI Renderer server?')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.isCreateServerButton)
                .onChange(async (value) => {
                        this.plugin.settings.isCreateServerButton = value;
                        await this.plugin.saveSettings();

                        this.utils.publishToggleVisibilityEvent(SERVER_BUTTON_ID, this.app.workspace, this.publisher)
                    }
                )
            );

        const serverGroup = containerEl.createEl('div', {cls: 'openapi-renderer-group'})
        new Setting(serverGroup)
            .setName('Server button locations')
            .setDesc('What location of button do you need? Choose below. You can choose more than one')

        const serverDetails = serverGroup.createEl('details', {cls: 'openapi-renderer-details'})
        serverDetails.createEl('summary', {text: 'Server button Locations', cls: 'openapi-renderer-summary'})

        this.utils.createLocationToggle(serverDetails, 'Ribbon button',
            ButtonLocation.Ribbon, SERVER_BUTTON_ID, settings.serverButtonLocations)
        this.utils.createLocationToggle(serverDetails, 'Toolbar button',
            ButtonLocation.Toolbar, SERVER_BUTTON_ID, settings.serverButtonLocations)
        this.utils.createLocationToggle(serverDetails, 'Statusbar button',
            ButtonLocation.Statusbar, SERVER_BUTTON_ID, settings.serverButtonLocations)


        new Setting(containerEl)
            .setName('Command buttons')
            .setDesc('Add buttons for OpenAPI Renderer commands in the Obsidian interface?')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.isCreateCommandButtons)
                .onChange(async (value) => {
                        this.plugin.settings.isCreateCommandButtons = value;
                        await this.plugin.saveSettings()
                        this.utils.publishToggleVisibilityEvent(RENDERER_BUTTON_ID, this.app.workspace, this.publisher)
                        this.utils.publishToggleVisibilityEvent(REFRESHER_BUTTON_ID, this.app.workspace, this.publisher)
                    }
                )
            )


        const renderGroup = containerEl.createEl('div', {cls: 'openapi-renderer-group'})
        new Setting(renderGroup)
            .setName('Command button locations')
            .setDesc('What location of button do you need? Choose below. You can choose more than one')


        const renderDetails = renderGroup.createEl('details', {cls: 'openapi-renderer-details'})
        renderDetails.createEl('summary', {text: 'Render button Locations', cls: 'openapi-renderer-summary'})

        this.utils.createLocationToggle(renderDetails, 'Ribbon button',
            ButtonLocation.Ribbon, RENDERER_BUTTON_ID, settings.renderButtonLocation)
        this.utils.createLocationToggle(renderDetails, 'Toolbar button',
            ButtonLocation.Toolbar, RENDERER_BUTTON_ID, settings.renderButtonLocation)
        this.utils.createLocationToggle(renderDetails, 'Statusbar button',
            ButtonLocation.Statusbar, RENDERER_BUTTON_ID, settings.renderButtonLocation)


        const refreshGroup = containerEl.createEl('div', {cls: 'openapi-renderer-group'})
        const refreshDetails = refreshGroup.createEl('details', {cls: 'openapi-renderer-details'})
        refreshDetails.createEl('summary', {text: 'Refresh button Locations', cls: 'openapi-renderer-summary'})

        this.utils.createLocationToggle(refreshDetails, 'Ribbon button',
            ButtonLocation.Ribbon, REFRESHER_BUTTON_ID, settings.refreshButtonLocation)
        this.utils.createLocationToggle(refreshDetails, 'Toolbar button',
            ButtonLocation.Toolbar, REFRESHER_BUTTON_ID, settings.refreshButtonLocation)
        this.utils.createLocationToggle(refreshDetails, 'Statusbar button',
            ButtonLocation.Statusbar, REFRESHER_BUTTON_ID, settings.refreshButtonLocation)

    }
}