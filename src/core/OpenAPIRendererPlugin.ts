import { Notice, Plugin, WorkspaceLeaf } from 'obsidian';
import {
    OpenAPIRendererEventObserver,
    OpenAPIRendererEventPublisher,
} from 'pluginEvents/eventManager';
import { DEFAULT_SETTINGS_Interface, PowerOffEvent } from 'typing/interfaces';
import { OpenAPISettingTab } from 'settings/settings';
import OpenAPIPluginContext from './contextManager';
import { OpenAPIRendererEventsHandler } from 'pluginEvents/eventsHandler';
import OpenAPIRendererServer from '../server/server';
import OpenAPIRendererPluginLogger from '../pluginLogging/loggingManager';
import { eventID, eventPublisher, Subject } from 'typing/constants';
import GithubClient from '../github/github-client';
import SettingsManager from './settingsManager';
import PluginUtils from './pluginUtils';
import PluginStateChecker from './pluginStateChecker';
import PluginResourceManager from './pluginResourceManager';
import { OpenAPIView } from 'view/OpenAPI/OpenAPI-view';
import { OpenAPIVersionView } from '../view/OpenAPI Version/openapi-version-view';
import { OPENAPI_VERSION_VIEW_TYPE, OpenAPIView_TYPE } from '../view/types';

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
    eventsHandler!: OpenAPIRendererEventsHandler;
    server!: OpenAPIRendererServer;
    logger!: OpenAPIRendererPluginLogger;
    publisher!: OpenAPIRendererEventPublisher;
    observer!: OpenAPIRendererEventObserver;
    githubClient!: GithubClient;
    settingsManager!: SettingsManager;
    pluginUtils!: PluginUtils;
    stateChecker!: PluginStateChecker;
    resourceManager!: PluginResourceManager;

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
        await this.initializeNetworking();
        await this.initializeUI();
        await this.initializeUtilities();
        this.addSettingTab(new OpenAPISettingTab(this.app, this));
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
        this.resourceManager = new PluginResourceManager(this.app, this);
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
        this.registerView(
            OpenAPIView_TYPE,
            (leaf) => new OpenAPIView(leaf, this)
        );
        this.registerView(
            OPENAPI_VERSION_VIEW_TYPE,
            (leaf: WorkspaceLeaf) => new OpenAPIVersionView(leaf, this)
        );
        this.registerExtensions(['yaml', 'yml', 'json'], OpenAPIView_TYPE);
    }

    private async initializeUtilities(): Promise<void> {
        this.pluginUtils = new PluginUtils(this.appContext);
        this.stateChecker = new PluginStateChecker(this, this.pluginUtils);
        // this.export = new Export(this.appContext);
        await this.stateChecker.checkResources();
    }
}
