import {MarkdownView, Notice, Plugin} from 'obsidian';
import {OpenAPIRendererEventObserver, OpenAPIRendererEventPublisher} from '../pluginEvents/eventEmitter'

import {DEFAULT_SETTINGS_Interface, OpenAPIRendererPluginInterface, PowerOffEvent} from '../typing/interfaces'
import {OpenAPISettingTab} from "../settings/settings";
import {OpenAPIPluginContext} from "./contextManager";
import {OpenAPIRenderer, PreviewHandler} from 'rendering/openAPIRender';
import {OpenAPIRendererEventsHandler} from 'pluginEvents/eventsHandler'
import OpenAPIRendererServer from "../server/server";
import OpenAPIMarkdownProcessor from "../rendering/markdownProcessor";
import OpenAPIRendererPluginLogger from "../pluginLogging/loggingManager";
import UIManager from '../UI/UIManager'
import {eventID, eventPublisher, RenderingMode, Subject} from "../typing/constants";
import {ExportModal} from "../export/exportModal";
import {Export} from "../export/pluginExport";
import {GithubClient} from "../github/github-client";
import {SettingsManager} from "./settingsManager";
import {PluginUtils} from "./pluginUtils";
import {PluginResourceManager} from "./pluginResourceManager";


/**
 * Represents the OpenAPI Renderer Plugin extending the core functionality of the application.
 * Manages settings, UI components, commands, and event handling related to OpenAPI rendering.
 */
export default class OpenAPIRendererPlugin extends Plugin {
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
    pluginUtils!: PluginUtils
    resourceManager!: PluginResourceManager

    private async initializePlugin(): Promise<void> {
        await this.initializeCore();
        this.initializeEventSystem();
        await this.initializeRendering();
        await this.initializeNetworking();
        await this.initializeUI();
        await this.initializeUtilities();
        this.addSettingTab(new OpenAPISettingTab(this.app, this));
        await this.initializeCommands()
    }


    private async initializeCore() {
        this.settingsManager = new SettingsManager(this)
        await this.settingsManager.loadSettings();
        this.appContext = new OpenAPIPluginContext(this.app, this);
        this.logger = new OpenAPIRendererPluginLogger(this.appContext)
    }

    private async initializeRendering() {
        this.openAPI = new OpenAPIRenderer(this.appContext);
        this.previewHandler = new PreviewHandler(this.appContext);
        this.markdownProcessor = new OpenAPIMarkdownProcessor(this.appContext)
        await this.markdownProcessor.registerProcessor()
    }

    private initializeEventSystem() {
        this.publisher = new OpenAPIRendererEventPublisher(this.appContext)
        this.observer = new OpenAPIRendererEventObserver(this.appContext)
        this.eventsHandler = new OpenAPIRendererEventsHandler(this.appContext);

        if (this.settings.isHTMLAutoUpdate) {
            this.registerEvent(this.appContext.app.vault
                .on('modify',
                    this.eventsHandler.modifyOpenAPISPec
                        .bind(this.eventsHandler)))
        }
    }

    private async initializeNetworking() {
        this.server = new OpenAPIRendererServer(this.appContext);
        this.githubClient = new GithubClient(this.appContext);
        this.settings.isServerAutoStart && await this.server.start()
    }

    private async initializeUI() {
        this.uiManager = new UIManager(this.appContext);
        await this.uiManager.initializeUI()
    }

    private async initializeUtilities() {
        this.pluginUtils = new PluginUtils(this.appContext);
        this.resourceManager = new PluginResourceManager(this, this.pluginUtils);
        this.export = new Export(this.appContext);
        await this.resourceManager.checkResources()
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
                    await this.openAPI.renderOpenAPIResources(view, RenderingMode.Inline);
                }
            },
        });

        this.addCommand({
            id: 'refresh-openapi',
            name: 'Refresh Swagger UI',
            callback: async () => {
                const view = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (view) {
                    this.previewHandler.previewManualUpdate(view);
                }
            },
        });

        this.addCommand({
            id: 'export-openapi',
            name: 'Export OpenAPI',
            callback: async () => {
                switch (this.settings.exportType) {
                    case 'none':
                        new ExportModal(this.app, this).open();
                        break;
                    case 'cdn':
                        await this.export.exportCDN();
                        break;
                    case 'all-in-the-one':
                        await this.export.exportFullyLocally();
                        break;
                    case 'zip':
                        await this.export.exportZip();
                        break;
                }
            }
        });
    }

    async onload(): Promise<void> {
        await this.initializePlugin()

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
     * Displays a notice message to the user.
     * @param message - The message to display in the notice.
     * @param duration - Optional. The duration in milliseconds for which the notice should be displayed.
     */
    showNotice(message: string, duration?: number): void {
        new Notice(message, duration);
    }
};
