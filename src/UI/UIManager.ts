import {MarkdownView} from 'obsidian';
import {OpenAPIPluginContext} from "../core/contextManager";
import {PowerOffEvent, UIPluginSettings} from '../typing/interfaces'
import {ButtonManager} from "./buttonManager";
import {Button} from "./Button";
import {eventID} from "../typing/constants";

/**
 * UIManager class manages the user interface elements related to OpenAPI Renderer Plugin in Obsidian.
 */
export default class UIManager {
    protected buttonManager: ButtonManager;
    appContext!: OpenAPIPluginContext

    constructor(appContext: OpenAPIPluginContext) {
        this.appContext = appContext;
        this.buttonManager = new ButtonManager(this);
    }

    /**
     * Initializes the UI components and managers after the workspace layout is ready.
     */
    async initializeUI(): Promise<void> {
        this.appContext.app.workspace.onLayoutReady(this.initializeUIManager.bind(this))
    }


    /**
     * Initializes the UI manager by creating buttons, registering events, and subscribing to power off events.
     * This method should be called after the workspace layout is ready.
     */
    private async initializeUIManager(): Promise<void> {
        await this.buttonManager.initializeButtons();
        this.registerEvents();
        this.appContext.plugin.observer.subscribe(
            this.appContext.app.workspace,
            eventID.PowerOff,
            this.onunload.bind(this)
        )
    }

    /**
     * Handles cleanup tasks when the plugin is unloaded or the app shuts down.
     * Removes all buttons managed by the button manager.
     * @param event The PowerOffEvent object.
     */
    private async onunload(event: PowerOffEvent): Promise<void> {
        await this.buttonManager.removeAllButtons()
    }

    /**
     * Retrieves and returns the UI settings relevant to the plugin.
     * This includes settings related to server button creation, command button creation,
     * and button locations for rendering and refreshing.
     * @returns The UIPluginSettings object containing the relevant UI settings.
     */
    get settings(): UIPluginSettings {
        const {settings} = this.appContext.plugin
        return {
            isCreateServerButton: settings.isCreateServerButton,
            isCreateCommandButtons: settings.isCreateCommandButtons,
            serverButtonLocations: settings.serverButtonLocations,
            renderButtonLocation: settings.renderButtonLocation,
            refreshButtonLocation: settings.refreshButtonLocation

        } as UIPluginSettings;
    }

    /**
     * Registers event listeners for updating toolbar buttons and managing button subscriptions.
     * - Listens for active leaf changes to update the toolbar.
     * - Subscribes to button events for managing their state and behavior.
     */
    private registerEvents(): void {
        this.appContext.plugin.registerEvent(
            this.appContext.app.workspace.on('active-leaf-change', async (leaf) => {
                if (leaf?.view instanceof MarkdownView) {
                    await this.buttonManager.updateToolbar(leaf)
                }
            })
        );
        this.buttonManager.buttons.forEach((button: Button) => {
            button.subscribe()
        });
    }
}

