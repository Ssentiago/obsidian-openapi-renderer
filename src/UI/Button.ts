import {ButtonConfig, ChangeButtonLocationEvent, ChangeServerButtonStateEvent, ToggleButtonVisibilityEvent} from "../typing/interfaces";
import {eventID} from "../typing/types";
import {setIcon} from "obsidian";
import {ButtonManager} from "./buttonManager";

abstract class AbstractButtonObject {
    constructor(public config: ButtonConfig, public buttonManager: ButtonManager) {
        this.config = config
        this.buttonManager = buttonManager
    }

    /**
     * Subscribes the button object to events or interactions.
     * Must be implemented by subclasses.
     * @abstract
     */
    abstract subscribe(): void;
}

export class Button extends AbstractButtonObject {
    constructor(config: ButtonConfig, buttonManager: ButtonManager) {
        super(config, buttonManager);
    }

    /**
     * Subscribes to various events for button behavior management.
     * - Subscribes to `ChangeButtonLocation` event to handle button location changes.
     * - Subscribes to `ToggleButtonVisibility` event to handle button visibility toggles.
     * - Subscribes to `ChangeServerButtonState` event if `buttonType` is 'server-button',
     *   to handle server button state changes.
     */
    subscribe() {
        debugger
        this.buttonManager.uiManager.appContext.plugin.observer.subscribe(
            this.buttonManager.uiManager.appContext.app.workspace,
            eventID.ChangeButtonLocation,
            this.changeButtonLocationHandler.bind(this)
        )

        this.buttonManager.uiManager.appContext.plugin.observer.subscribe(
            this.buttonManager.uiManager.appContext.app.workspace,
            eventID.ToggleButtonVisibility,
            this.toggleButtonVisibilityHandler.bind(this)
        )

        if (this.config.buttonType === 'server-button') {
            this.buttonManager.uiManager.appContext.plugin.observer.subscribe(
                this.buttonManager.uiManager.appContext.app.workspace,
                eventID.ServerStarted,
                this.serverButtonChangeStateHandler.bind(this)
            )
        }
    }

    /**
     * Handles the event when the server button state changes.
     * If the event data location matches the configured location,
     * updates the icon of the specified HTML element with the configured icon.
     * @param event The `ChangeServerButtonStateEvent` containing the event data.
     */
    private async serverButtonChangeStateHandler(event: ChangeServerButtonStateEvent) {
        if (this.config.location === event?.data.location) {
            let serverStarted = this.buttonManager.uiManager.appContext.plugin.server.isRunning()
            console.log(serverStarted)
            let icon = this.config.icon
            console.log(icon)
            let htmlElement = this.config.htmlElement
            if (htmlElement) {
                setIcon(htmlElement, this.config.icon)
            }
        }
    }

    /**
     * Handles the event when the button location changes.
     * Updates button visibility based on the old and new locations and button ID.
     * @param event The `ChangeButtonLocationEvent` containing the event data.
     */
    private async changeButtonLocationHandler(event: ChangeButtonLocationEvent) {
        this.buttonManager.updateButtonVisibilityByLocationAndID(event.data.oldLocation, event.data.buttonID)
        this.buttonManager.updateButtonVisibilityByLocationAndID(event.data.location, event.data.buttonID)
    }

    /**
     * Handles the event when the button visibility is toggled.
     * Updates button visibility based on the event's location and button ID.
     * @param event The `ToggleButtonVisibilityEvent` containing the event data.
     */
    private async toggleButtonVisibilityHandler(event: ToggleButtonVisibilityEvent) {
        debugger
        this.buttonManager.updateButtonVisibilityByLocationAndID(event.data.location, event.data.buttonID)
    }

}