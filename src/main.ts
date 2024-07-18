import {MarkdownView, Notice, Plugin} from 'obsidian';
import {OpenAPIRendererEventObserver, OpenAPIRendererEventPublisher} from './pluginEvents/eventEmitter'

import {DEFAULT_SETTINGS_Interface, OpenAPIRendererPluginInterface, PowerOffEvent, ToggleButtonVisibilityEvent} from './typing/interfaces'
import {OpenAPISettingTab} from "./settings/settings";
import {OpenAPIPluginContext} from "./contextManager";
import {OpenAPIRenderer, PreviewHandler} from 'rendering/openAPIRender';
import {OpenAPIRendererEventsHandler} from 'pluginEvents/eventsHandler'
import OpenAPIRendererServer from "./server/server";
import OpenAPIMarkdownProcessor from "./rendering/markdownProcessor";
import OpenAPIRendererPluginLogger from "./pluginLogging/loggingManager";
import UIManager from './UI/UIManager'
import path from "path";
import {ButtonLocation, eventID, eventPublisher, RenderingMode, Subject} from "./typing/constants";


/**
 * Represents the OpenAPI Renderer Plugin extending the core functionality of the application.
 * Manages settings, UI components, commands, and event handling related to OpenAPI rendering.
 */
export default class OpenAPIRendererPlugin extends Plugin implements OpenAPIRendererPluginInterface {
    settings!: DEFAULT_SETTINGS_Interface;
    settingsTab!: OpenAPISettingTab;
    appContext!: OpenAPIPluginContext;
    openAPI!: OpenAPIRenderer;
    previewHandler!: PreviewHandler;
    eventsHandler!: OpenAPIRendererEventsHandler;
    server!: OpenAPIRendererServer;
    markdownProcessor!: OpenAPIMarkdownProcessor;
    logger!: OpenAPIRendererPluginLogger
    uiManager!: UIManager
    publisher!: OpenAPIRendererEventPublisher
    observer!: OpenAPIRendererEventObserver


    /**
     * Initializes the OpenAPI plugin.
     * @async
     * @private
     * @returns A promise that resolves when initialization is complete.
     */
    private async initializePlugin(): Promise<void> {
        await this.loadSettings();
        this.appContext = new OpenAPIPluginContext(this.app, this);
        this.logger = new OpenAPIRendererPluginLogger(this.appContext)
        this.publisher = new OpenAPIRendererEventPublisher(this.appContext)
        this.observer = new OpenAPIRendererEventObserver(this.appContext)
        this.settingsTab = new OpenAPISettingTab(this.app, this, this.publisher);
        this.openAPI = new OpenAPIRenderer(this.appContext);
        this.previewHandler = new PreviewHandler(this.appContext);
        this.eventsHandler = new OpenAPIRendererEventsHandler(this.appContext);
        this.server = new OpenAPIRendererServer(this.appContext)
        this.markdownProcessor = new OpenAPIMarkdownProcessor(this.appContext)


        this.uiManager = new UIManager(this.appContext)
        this.addSettingTab(this.settingsTab);
    }

    /**
     * Initializes commands for rendering and refreshing Swagger UI.
     * Adds commands to render OpenAPI resources inline or in a modal view,
     * and to refresh the Swagger UI preview in a Markdown view.
     * @async
     * @returns A promise that resolves when commands are initialized.
     */
    private async initializeCommands(): Promise<void> {
        this.addCommand({
            id: 'render-openapi-inline',
            name: 'Render Swagger UI inline',
            editorCallback: async (editor, view) => {
                await this.renderOpenAPI(view as MarkdownView, RenderingMode.Inline)
            },
        });

        this.addCommand({
            id: 'refresh-openapi',
            name: 'Refresh Swagger UI',
            editorCallback: async (editor, view) => {
                debugger
                await this.refreshOpenAPI(view as MarkdownView)
            },
        });

        this.addCommand({
            id: 'render-openapi-modal',
            name: 'Render Swagger UI modal',
            editorCallback: async (editor, view) => {
                await this.renderOpenAPI(view as MarkdownView, RenderingMode.Modal)
            },
        });
    }

    /**
     * Initializes the user interface by initializing the UI manager.
     * This method awaits the initialization of the UI manager.
     * @async
     * @returns A promise that resolves when the UI initialization is complete.
     */
    private async initializeUI(): Promise<void> {
        await this.uiManager.initializeUI()
    }

    /**
     * Lifecycle method called when the plugin is loaded.
     * Initializes the plugin by loading settings, initializing commands,
     * starting the server if auto-start is enabled, initializing the user interface,
     * and registering event listener for auto-update functionality.
     * @async
     */
    async onload(): Promise<void> {
        await this.initializePlugin()
        await this.initializeCommands()
        this.settings.isServerAutoStart && await this.server.start()
        await this.initializeUI()
        await this.markdownProcessor.registerProcessor()
        this.settings.isAutoUpdate &&
        this.registerEvent(this.appContext.app.vault
            .on('modify', this.eventsHandler.modifyOpenAPISPec.bind(this.eventsHandler)))
    }

    /**
     * Lifecycle method called when the plugin is unloaded.
     * Publishes a `PowerOff` event indicating the plugin is shutting down.
     */
    async onunload(): Promise<void> {
        const event = {
            eventID: eventID.PowerOff,
            timestamp: new Date(),
            publisher: eventPublisher.App,
            subject: Subject.classes,
            emitter: this.app.workspace,
        } as PowerOffEvent;
        this.publisher.publish(event);
    }

    /**
     * Loads plugin settings from persistent storage.
     * If no settings are found, defaults are used.
     * Converts array-based locations to Set objects for efficient lookup.
     * @async
     */
    async loadSettings(): Promise<void> {

        const userSettings = await this.loadData();

        const defaultSettings = this.getDefaultSettings();

        const settings = Object.assign({}, defaultSettings, userSettings);

        this.settings = {
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
            ...this.settings,
            renderButtonLocation: Array.from(this.settings.renderButtonLocation),
            refreshButtonLocation: Array.from(this.settings.refreshButtonLocation),
            serverButtonLocations: Array.from(this.settings.serverButtonLocations)
        };

        await this.saveData(saveData);

    }

    /**
     * Resets plugin settings to default values by removing the configuration file.
     * @async
     */
    async resetSettings(): Promise<void> {
        const pluginPath = this.manifest.dir
        if (pluginPath) {
            const configPath = path.join(pluginPath, '/data.json')
            await this.app.vault.adapter.remove(configPath)
            await this.loadSettings()
            const event = {
                eventID: eventID.ToggleButtonVisibility,
                timestamp: new Date(),
                publisher: eventPublisher.App,
                subject: Subject.classes,
                emitter: this.app.workspace,
                data: {
                    buttonID: null
                }
            } as ToggleButtonVisibilityEvent;
            this.publisher.publish(event);
        }
    }

    /**
     * Returns default settings for the OpenAPI plugin.
     * @returns Default settings object.
     */
    getDefaultSettings(): DEFAULT_SETTINGS_Interface {
        return {
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
            renderButtonLocation: new Set([ButtonLocation.Toolbar]),
            refreshButtonLocation: new Set([ButtonLocation.Toolbar]),
            serverButtonLocations: new Set([ButtonLocation.Ribbon]),
            theme: 'light',
            timeoutUnit: 'milliseconds',
            timeout: 2000
        }
    }

    /**
     * Renders OpenAPI resources into a Markdown view.
     * @async
     * @param view - The Markdown view to render OpenAPI resources into.
     * @param mode - The rendering mode (Inline or Modal).
     * @returns A promise that resolves when rendering is complete.
     */
    async renderOpenAPI(view: MarkdownView, mode: RenderingMode): Promise<void> {
        try {
            await this.openAPI.renderOpenAPIResources(view, mode)
        } catch (e: any) {

            this.showNotice('Something went wrong while rendering open API. Maybe check the logs?')
        }
    }

    /**
     * Refreshes the OpenAPI preview in a Markdown view.
     * @async
     * @param view - The Markdown view where the OpenAPI preview should be refreshed.
     * @returns A promise that resolves when the refresh operation is complete.
     */
    async refreshOpenAPI(view: MarkdownView): Promise<void> {
        this.previewHandler.previewManualUpdate(view)
    }

    /**
     * Displays a notice message to the user.
     * @param message - The message to display in the notice.
     * @param duration - Optional. The duration in milliseconds for which the notice should be displayed.
     */
    showNotice(message: string, duration?: number): void {
        new Notice(message, duration);
    }
};
