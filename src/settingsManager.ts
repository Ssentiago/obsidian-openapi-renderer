import OpenAPIRendererPlugin from "./main";
import path from "path";
import {ButtonLocation, eventID, eventPublisher, Subject} from "./typing/constants";
import {DEFAULT_SETTINGS_Interface, ToggleButtonVisibilityEvent} from "./typing/interfaces";

export class SettingsManager {
    plugin: OpenAPIRendererPlugin

    constructor(plugin: OpenAPIRendererPlugin) {
        this.plugin = plugin
    }

    async loadSettings(): Promise<void> {

        const userSettings = await this.plugin.loadData();

        const defaultSettings = this.defaultSettings

        const settings = Object.assign({}, defaultSettings, userSettings);

        this.plugin.settings = {
            ...settings,
            renderButtonLocation: new Set(settings.renderButtonLocation),
            refreshButtonLocation: new Set(settings.refreshButtonLocation),
            serverButtonLocations: new Set(settings.serverButtonLocations),
        }

    }

    /**
     * Saves current plugin settings to persistent storage.
     * Converts Set-based button locations to arrays for serialization.
     * @async
     */
    async saveSettings(): Promise<void> {
        const saveData = {
            ...this.plugin.settings,
            renderButtonLocation: Array.from(this.plugin.settings.renderButtonLocation),
            refreshButtonLocation: Array.from(this.plugin.settings.refreshButtonLocation),
            serverButtonLocations: Array.from(this.plugin.settings.serverButtonLocations)
        };

        await this.plugin.saveData(saveData);

    }

    /**
     * Resets plugin settings to default values by removing the configuration file.
     * @async
     */
    async resetSettings(): Promise<void> {
        const pluginPath = this.plugin.manifest.dir
        if (pluginPath) {
            const configPath = path.join(pluginPath, '/data.json')
            await this.plugin.app.vault.adapter.remove(configPath)
            await this.loadSettings()
            const event = {
                eventID: eventID.ToggleButtonVisibility,
                timestamp: new Date(),
                publisher: eventPublisher.App,
                subject: Subject.classes,
                emitter: this.plugin.app.workspace,
                data: {
                    buttonID: null
                }
            } as ToggleButtonVisibilityEvent;
            this.plugin.publisher.publish(event);
        }
    }

    /**
     * Returns default settings for the OpenAPI plugin.
     * @returns Default settings object.
     */
    get defaultSettings(): DEFAULT_SETTINGS_Interface {
        return {
            htmlFileName: 'openapi-spec.html',
            openapiSpecFileName: 'openapi-spec.yaml',
            iframeWidth: '100%',
            iframeHeight: '600px',
            isAutoUpdate: false,
            serverHostName: '127.0.0.1',
            serverPort: 8080,
            proxyHostName: '127.0.0.1',
            proxyPort: 47899,
            isServerAutoStart: false,
            isCreateServerButton: true,
            isCreateCommandButtons: false,
            renderButtonLocation: new Set([ButtonLocation.Toolbar]),
            refreshButtonLocation: new Set([ButtonLocation.Toolbar]),
            serverButtonLocations: new Set([ButtonLocation.Ribbon]),
            theme: 'light',
            timeoutUnit: 'milliseconds',
            timeout: 2000,
            exportType: 'none'
        }
    }
}