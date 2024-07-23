import OpenAPIRendererPlugin from '../core/OpenAPIRendererPlugin';
import { OpenAPIRendererEventPublisher } from '../pluginEvents/eventEmitter';
import { App, Setting } from 'obsidian';
import SettingsUtils from './utils';
import {
    ButtonLocation,
    REFRESHER_BUTTON_ID,
    RENDERER_BUTTON_ID,
    SERVER_BUTTON_ID,
} from '../typing/constants';
import { SettingSectionParams } from '../typing/interfaces';

/**
 * Represents the UI settings section within the OpenAPI Renderer plugin settings.
 * Allows users to customize UI elements such as server start buttons and command buttons.
 */
export default class UISettings {
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

    /**
     * Displays UI-related settings in the given container element.
     *
     * @param containerEl - The HTML element where the settings will be displayed.
     *
     */
    display(containerEl: HTMLElement): void {
        const { settings } = this.plugin;

        new Setting(containerEl)
            .setName('Start server button')
            .setDesc(
                'Enable a button to quickly start the OpenAPI Renderer server.'
            )
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.isCreateServerButton)
                    .onChange(async (value) => {
                        this.plugin.settings.isCreateServerButton = value;
                        await this.plugin.settingsManager.saveSettings();

                        this.utils.publishToggleVisibilityEvent(
                            SERVER_BUTTON_ID,
                            this.app.workspace,
                            this.publisher
                        );
                    })
            );

        const serverGroup = containerEl.createEl('div', {
            cls: 'openapi-renderer-group',
        });
        new Setting(serverGroup)
            .setName('Server button locations')
            .setDesc(
                'Select where you want the server start button to appear. You can choose multiple locations.'
            );

        const serverDetails = serverGroup.createEl('details', {
            cls: 'openapi-renderer-details',
        });
        serverDetails.createEl('summary', {
            text: 'Server button Locations',
            cls: 'openapi-renderer-summary',
        });

        new Setting(serverDetails)
            .setName('Ribbon button')
            .setDesc(
                'Ribbon buttons are enabled by default. ' +
                    'You can customize their visibility and order in Obsidian’s settings: Appearance -> Ribbon menu configuration -> Manage.'
            );
        this.utils.createLocationToggle(
            serverDetails,
            'Toolbar button',
            ButtonLocation.Toolbar,
            SERVER_BUTTON_ID,
            settings.serverButtonLocations
        );
        this.utils.createLocationToggle(
            serverDetails,
            'Statusbar button',
            ButtonLocation.Statusbar,
            SERVER_BUTTON_ID,
            settings.serverButtonLocations
        );

        new Setting(containerEl)
            .setName('Command buttons')
            .setDesc(
                'Enable buttons for OpenAPI Renderer commands in the Obsidian interface.'
            )
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.isCreateCommandButtons)
                    .onChange(async (value) => {
                        this.plugin.settings.isCreateCommandButtons = value;
                        await this.plugin.settingsManager.saveSettings();
                        this.utils.publishToggleVisibilityEvent(
                            RENDERER_BUTTON_ID,
                            this.app.workspace,
                            this.publisher
                        );
                        this.utils.publishToggleVisibilityEvent(
                            REFRESHER_BUTTON_ID,
                            this.app.workspace,
                            this.publisher
                        );
                    })
            );

        const renderGroup = containerEl.createEl('div', {
            cls: 'openapi-renderer-group',
        });
        new Setting(renderGroup)
            .setName('Render button locations')
            .setDesc(
                'Select where you want the render button to appear. You can choose multiple locations.'
            );

        const renderDetails = renderGroup.createEl('details', {
            cls: 'openapi-renderer-details',
        });
        renderDetails.createEl('summary', {
            text: 'Render button Locations',
            cls: 'openapi-renderer-summary',
        });

        new Setting(renderDetails)
            .setName('Ribbon button')
            .setDesc(
                'Ribbon buttons are enabled by default. ' +
                    'You can customize their visibility and order in Obsidian’s settings: Appearance -> Ribbon menu configuration -> Manage.'
            );
        this.utils.createLocationToggle(
            renderDetails,
            'Toolbar button',
            ButtonLocation.Toolbar,
            RENDERER_BUTTON_ID,
            settings.renderButtonLocation
        );
        this.utils.createLocationToggle(
            renderDetails,
            'Statusbar button',
            ButtonLocation.Statusbar,
            RENDERER_BUTTON_ID,
            settings.renderButtonLocation
        );

        const refreshGroup = containerEl.createEl('div', {
            cls: 'openapi-renderer-group',
        });

        new Setting(refreshGroup)
            .setName('Refresh button locations')
            .setDesc(
                'Select where you want the refresh button to appear. You can choose multiple locations.'
            );

        const refreshDetails = refreshGroup.createEl('details', {
            cls: 'openapi-renderer-details',
        });
        refreshDetails.createEl('summary', {
            text: 'Refresh button Locations',
            cls: 'openapi-renderer-summary',
        });

        new Setting(refreshDetails)
            .setName('Ribbon button')
            .setDesc(
                'Ribbon buttons are enabled by default. ' +
                    'You can customize their visibility and order in Obsidian’s settings: Appearance -> Ribbon menu configuration -> Manage.'
            );
        this.utils.createLocationToggle(
            refreshDetails,
            'Toolbar button',
            ButtonLocation.Toolbar,
            REFRESHER_BUTTON_ID,
            settings.refreshButtonLocation
        );
        this.utils.createLocationToggle(
            refreshDetails,
            'Statusbar button',
            ButtonLocation.Statusbar,
            REFRESHER_BUTTON_ID,
            settings.refreshButtonLocation
        );
    }
}
