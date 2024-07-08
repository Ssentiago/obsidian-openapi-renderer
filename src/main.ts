import {MarkdownView, Notice, Plugin} from 'obsidian';
import {OpenAPIRendererEventObserver, OpenAPIRendererEventPublisher} from './pluginEvents/eventEmitter'

import {DEFAULT_SETTINGS_Interface, OpenAPIRendererPluginInterface, PowerOffEvent} from './typing/interfaces'
import {DEFAULT_SETTINGS, OpenAPISettingTab} from "./settings";
import {OpenAPIPluginContext} from "./contextManager";
import {OpenAPIRenderer, PreviewHandler} from 'rendering/openAPIRender';
import {OpenAPIRendererEventsHandler} from 'pluginEvents/eventsHandler'
import OpenAPIRendererServer from "./server/server";
import OpenAPIMarkdownProcessor from "./rendering/markdownProcessor";
import OpenAPIRendererPluginLogger from "./pluginLogging/loggingManager";
import UIManager from './UI/UIManager'
import {eventID, eventPublisher, RenderingMode, Subject} from "./typing/types";

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
        this.publisher = new OpenAPIRendererEventPublisher(this.appContext)
        this.observer = new OpenAPIRendererEventObserver(this.appContext)
        this.settingsTab = new OpenAPISettingTab(this.app, this, this.publisher);
        this.openAPI = new OpenAPIRenderer(this.appContext);
        this.previewHandler = new PreviewHandler(this.appContext);
        this.eventsHandler = new OpenAPIRendererEventsHandler(this.appContext);
        this.server = new OpenAPIRendererServer(this.appContext)
        this.markdownProcessor = new OpenAPIMarkdownProcessor(this.appContext)
        this.logger = new OpenAPIRendererPluginLogger(this.appContext)


        this.uiManager = new UIManager(this.appContext)
        this.addSettingTab(this.settingsTab);
    }

    /**
     * Initializes commands for rendering and refreshing Swagger UI.
     * Adds commands to check for active MarkdownView and perform corresponding actions.
     *
     * @returns A promise that resolves when commands are initialized.
     */
    private async initializeCommands(): Promise<void> {
        this.addCommand({
            id: 'render-openapi-inline',
            name: 'Render Swagger UI inline',
            editorCallback: (editor, view) => {
                this.renderOpenAPI(view as MarkdownView, RenderingMode.Inline)
            },
        });

        this.addCommand({
            id: 'refresh-openapi',
            name: 'Refresh Swagger UI',
            editorCallback: (editor, view) => {
                this.refreshOpenAPI(view as MarkdownView)
            },
        });

        this.addCommand({
            id: 'render-openapi-modal',
            name: 'Render Swagger UI modal',
            editorCallback: (editor, view) => {
                this.renderOpenAPI(view as MarkdownView, RenderingMode.Modal)
            },
        });
    }

    /**
     * Initializes the user interface by initializing the UI manager.
     * This method awaits the initialization of the UI manager.
     */
    private async initializeUI() {
        await this.uiManager.initializeUI()
    }


    async onload() {

        await this.initializePlugin()
        await this.initializeCommands()
        this.settings.isServerAutoStart && await this.server.start()
        await this.initializeUI()
        await this.markdownProcessor.registerProcessor()

        this.settings.isAutoUpdate &&
        this.registerEvent(this.appContext.app.vault
            .on('modify', this.eventsHandler.modifyOpenAPISPec.bind(this.eventsHandler)))

    }

    async onunload() {
        const event = {
            eventID: eventID.PowerOff,
            timestamp: new Date(),
            publisher: eventPublisher.App,
            subject: Subject.classes,
            emitter: this.app.workspace,
        } as PowerOffEvent;
        this.publisher.publish(event)
    };

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async resetSettings() {
        const configPath = this.manifest.dir + '/data.json'
        await this.app.vault.adapter.remove(configPath)
        this.settings = Object.assign({}, DEFAULT_SETTINGS);
        await this.saveSettings()
    }

    /**
     * Renders OpenAPI resources into a Markdown view.
     * @async
     * @param view - The Markdown view to render OpenAPI resources into.
     * @param mode - the chosen mode to render OpenAPI preview
     * @returns A promise that resolves when rendering is complete.
     */
    async renderOpenAPI(view: MarkdownView, mode: RenderingMode) {
        if (view) {
            try {
                await this.openAPI.renderOpenAPIResources(view, mode)
            } catch (e: any) {
                this.logger.debug(e)
            }
        } else {
            this.showNotice('No active view')
        }
    }

    /**
     * Refreshes the OpenAPI preview in a Markdown view.
     * @async
     * @param view The Markdown view where the OpenAPI preview should be refreshed.
     * @returns A promise that resolves when the refresh operation is complete.
     */
    async refreshOpenAPI(view: MarkdownView) {
        if (view) {
            this.previewHandler.previewManualUpdate(view)
        } else {
            this.showNotice('No active view')
        }
    }

    showNotice(message: string, duration?: number) {
        new Notice(message, duration);
    }
};
