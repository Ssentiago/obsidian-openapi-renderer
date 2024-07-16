import OpenAPIRendererPlugin from "../main";
import {OpenAPIRendererEventPublisher} from "../pluginEvents/eventEmitter";
import {App, Setting} from "obsidian";
import {ButtonLocation, REFRESHER_BUTTON_ID, RENDERER_BUTTON_ID, SERVER_BUTTON_ID} from "../typing/types";
import {SettingsUtils} from "./utils";


export class UISettings {
    app: App;
    plugin: OpenAPIRendererPlugin
    publisher: OpenAPIRendererEventPublisher
    utils: SettingsUtils

    constructor(
        app: App,
        plugin: OpenAPIRendererPlugin,
        publisher: OpenAPIRendererEventPublisher,
    ) {
        this.app = app
        this.plugin = plugin
        this.publisher = publisher
        this.utils = new SettingsUtils(this.app, this.plugin, this.publisher)
    }

    display(containerEl: HTMLElement) {
        const {settings} = this.plugin

        new Setting(containerEl)
            .setName('UI Customization')
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
            .setName('Server button location')
            .setDesc('What location of button do you need? Choose below. You can choose more than one')

        const serverDetails = serverGroup.createEl('details', {cls: 'openapi-renderer-details'})
        serverDetails.createEl('summary', {text: 'Server Button Locations', cls: 'openapi-renderer-summary'})

        this.utils.createLocationToggle(serverDetails, 'Ribbon Button',
            ButtonLocation.Ribbon, SERVER_BUTTON_ID, settings.serverButtonLocations)
        this.utils.createLocationToggle(serverDetails, 'Statusbar Button',
            ButtonLocation.Statusbar, SERVER_BUTTON_ID, settings.serverButtonLocations)
        this.utils.createLocationToggle(serverDetails, 'Toolbar Button',
            ButtonLocation.Toolbar, SERVER_BUTTON_ID, settings.serverButtonLocations)

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
        const renderDetails = renderGroup.createEl('details', {cls: 'openapi-renderer-details'})
        renderDetails.createEl('summary', {text: 'Render Button Locations', cls: 'openapi-renderer-summary'})

        this.utils.createLocationToggle(renderDetails, 'Ribbon Button',
            ButtonLocation.Ribbon, RENDERER_BUTTON_ID, settings.renderButtonLocation)
        this.utils.createLocationToggle(renderDetails, 'Statusbar Button',
            ButtonLocation.Statusbar, RENDERER_BUTTON_ID, settings.renderButtonLocation)
        this.utils.createLocationToggle(renderDetails, 'Toolbar Button',
            ButtonLocation.Toolbar, RENDERER_BUTTON_ID, settings.renderButtonLocation)

        const refreshGroup = containerEl.createEl('div', {cls: 'openapi-renderer-group'})
        const refreshDetails = refreshGroup.createEl('details', {cls: 'openapi-renderer-details'})
        refreshDetails.createEl('summary', {text: 'Refresh Button Locations', cls: 'openapi-renderer-summary'})

        this.utils.createLocationToggle(refreshDetails, 'Ribbon Button',
            ButtonLocation.Ribbon, REFRESHER_BUTTON_ID, settings.refreshButtonLocation)
        this.utils.createLocationToggle(refreshDetails, 'Statusbar Button',
            ButtonLocation.Statusbar, REFRESHER_BUTTON_ID, settings.refreshButtonLocation)
        this.utils.createLocationToggle(refreshDetails, 'Toolbar Button',
            ButtonLocation.Toolbar, REFRESHER_BUTTON_ID, settings.refreshButtonLocation)
    }
}