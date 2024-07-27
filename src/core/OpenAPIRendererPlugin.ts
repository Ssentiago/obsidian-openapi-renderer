import { MarkdownView, Notice, Plugin } from 'obsidian';
import {
    OpenAPIRendererEventObserver,
    OpenAPIRendererEventPublisher,
} from '../pluginEvents/eventManager';

import {
    DEFAULT_SETTINGS_Interface,
    PowerOffEvent,
} from '../typing/interfaces';
import { OpenAPISettingTab } from '../settings/settings';
import OpenAPIPluginContext from './contextManager';
import { OpenAPIRenderer, PreviewHandler } from 'rendering/openAPIRender';
import { OpenAPIRendererEventsHandler } from 'pluginEvents/eventsHandler';
import OpenAPIRendererServer from '../server/server';
import OpenAPIMarkdownProcessor from '../rendering/markdownProcessor';
import OpenAPIRendererPluginLogger from '../pluginLogging/loggingManager';
import UIManager from '../UI/UIManager';
import {
    eventID,
    eventPublisher,
    RenderingMode,
    Subject,
} from '../typing/constants';
import ExportModal from '../export/exportModal';
import Export from '../export/pluginExport';
import GithubClient from '../github/github-client';
import SettingsManager from './settingsManager';
import PluginUtils from './pluginUtils';
import PluginResourceManager from './pluginResourceManager';

import SwaggerView from '../view/swagger-view';

/**
 * OpenAPI Renderer Plugin for initializing, configuring, and managing OpenAPI resources.
 *
 * This plugin handles:
 * - Core setup and configuration
 * - Event management
 * - Rendering and UI
 * - Networking and utilities
 * - Command registration
 * - Notifications and export functionality
 *
 * @extends Plugin
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
    logger!: OpenAPIRendererPluginLogger;
    uiManager!: UIManager;
    publisher!: OpenAPIRendererEventPublisher;
    observer!: OpenAPIRendererEventObserver;
    export!: Export;
    githubClient!: GithubClient;
    settingsManager!: SettingsManager;
    pluginUtils!: PluginUtils;
    resourceManager!: PluginResourceManager;

    /**
     * Initializes the plugin by performing core setup tasks sequentially.
     *
     * This includes initializing core components, event system, rendering,
     * networking, UI, utilities, adding a settings tab, and commands.
     *
     * @returns {Promise<void>} A promise that resolves when initialization is complete.
     *
     * @private
     */
    private async initializePlugin(): Promise<void> {
        await this.initializeCore();
        this.initializeEventSystem();
        await this.initializeRendering();
        await this.initializeNetworking();
        await this.initializeUI();
        await this.initializeUtilities();
        this.addSettingTab(new OpenAPISettingTab(this.app, this));
        await this.initializeCommands();
    }

    /**
     * Initializes core components of the plugin.
     *
     * This method:
     * - Creates and loads settings using `SettingsManager`.
     * - Initializes `OpenAPIPluginContext` with the current application and plugin.
     * - Creates a logger instance using `OpenAPIRendererPluginLogger`.
     *
     * @returns A promise that resolves when core initialization is complete.
     *
     * @private
     */
    private async initializeCore(): Promise<void> {
        this.settingsManager = new SettingsManager(this);
        await this.settingsManager.loadSettings();
        this.appContext = new OpenAPIPluginContext(this.app, this);
        this.logger = new OpenAPIRendererPluginLogger(this.appContext);
    }

    /**
     * Initializes rendering components of the plugin.
     *
     * This method:
     * - Creates instances of `OpenAPIRenderer` and `PreviewHandler`.
     * - Initializes `OpenAPIMarkdownProcessor` and registers the Markdown processor.
     *
     * @returns A promise that resolves when rendering initialization is complete.
     *
     * @private
     */
    private async initializeRendering(): Promise<void> {
        this.openAPI = new OpenAPIRenderer(this.appContext);
        this.previewHandler = new PreviewHandler(this.appContext);
        this.markdownProcessor = new OpenAPIMarkdownProcessor(this.appContext);
        await this.markdownProcessor.registerProcessor();
        this.registerView(
            'swagger-view',
            (leaf) => new SwaggerView(leaf, this)
        );
    }

    /**
     * Initializes the event system for the plugin.
     *
     * This method:
     * - Creates instances of `OpenAPIRendererEventPublisher`, `OpenAPIRendererEventObserver`,
     *   and `OpenAPIRendererEventsHandler`.
     * - Registers an event handler for HTML auto-update if the setting is enabled.
     *
     * @private
     */
    private initializeEventSystem(): void {
        this.publisher = new OpenAPIRendererEventPublisher(this.appContext);
        this.observer = new OpenAPIRendererEventObserver(this.appContext);
        this.eventsHandler = new OpenAPIRendererEventsHandler(this.appContext);

        if (this.settings.isHTMLAutoUpdate) {
            this.registerEvent(
                this.appContext.app.vault.on(
                    'modify',
                    this.eventsHandler.modifyOpenAPISPec.bind(
                        this.eventsHandler
                    )
                )
            );
        }
    }

    /**
     * Initializes networking components of the plugin.
     *
     * This method:
     * - Creates instances of `OpenAPIRendererServer` and `GithubClient`.
     * - Starts the server if the auto-start setting is enabled.
     *
     * @returns A promise that resolves when networking initialization is complete.
     *
     * @private
     */
    private async initializeNetworking(): Promise<void> {
        this.server = new OpenAPIRendererServer(this.appContext);
        this.githubClient = new GithubClient(this.appContext);
        this.settings.isServerAutoStart && (await this.server.start());
    }

    /**
     * Initializes the user interface components of the plugin.
     *
     * This method:
     * - Creates an instance of `UIManager`.
     * - Initializes the UI through `UIManager`.
     *
     * @returns A promise that resolves when UI initialization is complete.
     *
     * @private
     */
    private async initializeUI(): Promise<void> {
        this.uiManager = new UIManager(this.appContext);
        await this.uiManager.initializeUI();
        this.addRibbonIcon('code', 'Open Swagger UI', async () => {
            await SwaggerView.activateView(this.app);
        });
    }

    /**
     * Initializes utility components of the plugin.
     *
     * This method:
     * - Creates instances of `PluginUtils`, `PluginResourceManager`, and `Export`.
     * - Checks resources through `PluginResourceManager`.
     *
     * @returns A promise that resolves when utility initialization is complete.
     *
     * @private
     */

    private async initializeUtilities(): Promise<void> {
        this.pluginUtils = new PluginUtils(this.appContext);
        this.resourceManager = new PluginResourceManager(
            this,
            this.pluginUtils
        );
        this.export = new Export(this.appContext);
        await this.resourceManager.checkResources();
    }

    /**
     * Initializes commands for the plugin.
     *
     * This method registers three commands:
     *
     * - **Render Swagger UI inline**: Renders Swagger UI inline in the active Markdown view.
     * - **Refresh Swagger UI**: Refreshes Swagger UI in the active Markdown view.
     * - **Export OpenAPI**: Exports OpenAPI resources based on the specified export type.
     *
     * @returns A promise that resolves when all commands are registered.
     *
     * @private
     */
    private async initializeCommands(): Promise<void> {
        this.addCommand({
            id: 'render-openapi-inline',

            name: 'Render Swagger UI inline',
            callback: async () => {
                const view =
                    this.app.workspace.getActiveViewOfType(MarkdownView);
                if (view) {
                    await this.openAPI.renderOpenAPIResources(
                        view,
                        RenderingMode.Inline
                    );
                }
            },
        });

        this.addCommand({
            id: 'refresh-openapi',
            name: 'Refresh Swagger UI',
            callback: async () => {
                const view =
                    this.app.workspace.getActiveViewOfType(MarkdownView);
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
            },
        });
    }

    /**
     * Lifecycle method called when the plugin is loaded.
     *
     * This method is responsible for initializing the plugin by calling `initializePlugin`.
     * It ensures that all necessary setup is completed when the plugin starts.
     *
     * @returns A promise that resolves when the plugin is fully initialized.
     */
    async onload(): Promise<void> {
        await this.initializePlugin();
    }

    /**
     * Lifecycle method called when the plugin is unloaded.
     *
     * This method publishes a power-off event to notify that the plugin is being unloaded.
     *
     * @returns A promise that resolves when the unload event has been published.
     */
    async onunload(): Promise<void> {
        const event = {
            eventID: eventID.PowerOff,
            timestamp: new Date(),
            publisher: eventPublisher.Plugin,
            subject: Subject.All,
            emitter: this.app.workspace,
        } as PowerOffEvent;
        this.publisher.publish(event);
    }

    /**
     * Shows a notification message to the user.
     *
     * @param {string} message - The notification message.
     * @param {number} [duration] - Optional duration (in milliseconds) for the notice.
     */
    showNotice(message: string, duration?: number): void {
        new Notice(message, duration);
    }
}
