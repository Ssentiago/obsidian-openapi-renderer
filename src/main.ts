import {MarkdownView, Notice, Plugin} from 'obsidian';
import {OpenAPIRendererEventObserver, OpenAPIRendererEventPublisher} from './pluginEvents/eventEmitter'

import {DEFAULT_SETTINGS_Interface, OpenAPIRendererPluginInterface, PowerOffEvent} from './typing/interfaces'
import {OpenAPISettingTab} from "./settings/settings";
import {OpenAPIPluginContext} from "./contextManager";
import {OpenAPIRenderer, PreviewHandler} from 'rendering/openAPIRender';
import {OpenAPIRendererEventsHandler} from 'pluginEvents/eventsHandler'
import OpenAPIRendererServer from "./server/server";
import OpenAPIMarkdownProcessor from "./rendering/markdownProcessor";
import OpenAPIRendererPluginLogger from "./pluginLogging/loggingManager";
import UIManager from './UI/UIManager'
import {eventID, eventPublisher, RenderingMode, Subject} from "./typing/constants";
import {ExportModal} from "./export/exportModal";
import {Export} from "./export/pluginExport";
import {GithubClient} from "./github/github-client";
import {SettingsManager} from "./settingsManager";


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
    export!: Export
    githubClient!: GithubClient
    settingsManager!: SettingsManager


    /**
     * Initializes the OpenAPI plugin.
     * @async
     * @private
     * @returns A promise that resolves when initialization is complete.
     */
    private async initializePlugin(): Promise<void> {
        this.settingsManager = new SettingsManager(this)
        await this.settingsManager.loadSettings();
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
        this.export = new Export(this.appContext)
        this.githubClient = new GithubClient(this.appContext)
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
            callback: async () => {
                const view = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (view) {
                    await this.renderOpenAPI(view as MarkdownView, RenderingMode.Inline)
                }
            },
        });

        this.addCommand({
            id: 'refresh-openapi',
            name: 'Refresh Swagger UI',
            callback: async () => {
                const view = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (view) {
                    await this.refreshOpenAPI(view as MarkdownView)
                }
            },
        });
        // todo
        // todo - методы про настройки вынести в отдельный класс
        this.addCommand({
            id: 'export-openapi',
            name: 'Export OpenAPI',
            callback: async () => {
                await this.exportHTML()
            }
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

        // await this.githubClient.downloadAssetsFromLastRelease()
    }

    /**
     * Lifecycle method called when the plugin is unloaded.
     * Publishes a `PowerOff` event indicating the plugin is shutting down.
     */
    async onunload(): Promise<void> {
        const event = {
            eventID: eventID.PowerOff,
            timestamp: new Date(),
            publisher: eventPublisher.Plugin,
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


    /**
     * Renders OpenAPI resources into a Markdown view.
     * @async
     * @param view - The Markdown view to render OpenAPI resources into.
     * @param mode - The rendering mode (Inline or Modal).
     * @returns A promise that resolves when rendering is complete.
     */
    async renderOpenAPI(view: MarkdownView, mode: RenderingMode): Promise<void> {
        await this.openAPI.renderOpenAPIResources(view, mode)
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

    async exportHTML() {
        switch (this.settings.exportType) {
            case 'none':
                new ExportModal(this.app, this).open()
                break
            case 'cdn':
                await this.export.exportCDN()
                break
            case 'all-in-the-one':
                await this.export.exportFullyLocally()
                break
            case 'zip':
                await this.export.exportZip()
                break
        }
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
