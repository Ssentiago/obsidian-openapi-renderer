import {ButtonConfig} from "../typing/interfaces";
import {ButtonManager} from "./buttonManager";
import {eventID} from "../typing/constants";

/**
 * Abstract base class for button objects.
 */
abstract class AbstractButtonObject {
    protected constructor(public config: ButtonConfig, public buttonManager: ButtonManager) {
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

/**
 * Represents a button object that interacts with the UI and manages its configuration.
 */
export class Button extends AbstractButtonObject {
    constructor(config: ButtonConfig, buttonManager: ButtonManager) {
        super(config, buttonManager);
    }

    /**
     * Subscribes the button instance to relevant events based on its configuration.
     * - Subscribes to `ToggleButtonVisibility` event to manage button visibility.
     * - Subscribes to `ServerChangedState` event if the button type is 'server-button',
     *   to handle server button state changes.
     */
    subscribe(): void {
        const {eventsHandler, observer} = this.buttonManager.uiManager.appContext.plugin;

        observer.subscribe(
            this.buttonManager.uiManager.appContext.app.workspace,
            eventID.ToggleButtonVisibility,
            eventsHandler.handleButtonVisibility(this)
        )
        if (this.config.buttonType === 'server-button') {
            this.buttonManager.uiManager.appContext.plugin.observer.subscribe(
                this.buttonManager.uiManager.appContext.app.workspace,
                eventID.ServerChangeButtonState,
                eventsHandler.handleServerButtonState(this)
            )
        }
    }
}