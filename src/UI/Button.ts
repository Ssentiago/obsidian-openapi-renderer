import {ButtonConfig, ChangeServerButtonStateEvent, ToggleButtonVisibilityEvent} from "../typing/interfaces";
import {eventID} from "../typing/types";
import {ButtonManager} from "./buttonManager";
import {setIcon} from "obsidian";

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
        const {observer} = this.buttonManager.uiManager.appContext.plugin
        observer.subscribe(
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
        debugger
        const elements = this.config.htmlElements?.values()
        if (elements) {
            for (const element of elements) {
                setIcon(element, this.config.icon)
            }
        }
    }


    /**
     * Handles the event when the button visibility is toggled.
     * Updates button visibility based on the event's location and button ID.
     * @param event The `ToggleButtonVisibilityEvent` containing the event data.
     */
    private async toggleButtonVisibilityHandler(event: ToggleButtonVisibilityEvent) {
        debugger
        if (event.data.buttonID !== this.config.id) return;
        const button = this.buttonManager.buttons.get(this.config.id)
        if (button) {
            this.buttonManager.toggleVisibility(button.config)
        }
    }


}