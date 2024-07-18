import {ButtonID} from "../typing/types";
import {App, Events, Setting} from "obsidian";
import {OpenAPIRendererEventPublisher} from "../pluginEvents/eventEmitter";
import {ToggleButtonVisibilityEvent} from "../typing/interfaces";
import OpenAPIRendererPlugin from "../main";
import {ButtonLocation, eventID, eventPublisher, Subject} from "../typing/constants";

/**
 * Utility class for managing settings-related operations in the OpenAPI Renderer plugin.
 */
export class SettingsUtils {
    app: App
    plugin: OpenAPIRendererPlugin
    publisher: OpenAPIRendererEventPublisher

    constructor(app: App, plugin: OpenAPIRendererPlugin, publisher: OpenAPIRendererEventPublisher) {
        this.app = app;
        this.plugin = plugin;
        this.publisher = publisher
    }

    /**
     * Creates a toggle setting for a button location within a given container.
     * Used in the UISettings class to configure button locations.
     * @param container The HTML element where the setting will be appended.
     * @param name The name or label for the setting toggle.
     * @param location The specific location of the button (e.g., Ribbon, Statusbar, Toolbar).
     * @param buttonId The unique identifier for the button associated with this location.
     * @param buttonContainer The set containing currently selected button locations.
     * @returns The Setting object representing the created toggle setting.
     */
    createLocationToggle(container: HTMLElement,
                         name: string,
                         location: ButtonLocation,
                         buttonId: ButtonID,
                         buttonContainer: Set<ButtonLocation>): Setting {
        this.plugin.logger.debug(`Creating toggle for ${name}, location: ${location}, buttonId: ${buttonId}`);
        this.plugin.logger.debug(`Current button container:`, Array.from(buttonContainer));
        return new Setting(container)
            .setName(name)
            .addToggle(toggle => {
                const initialValue = buttonContainer.has(location);
                this.plugin.logger.debug(`Initial value for ${name}: ${initialValue}`);
                toggle.setValue(initialValue)
                    .onChange(async (value) => {
                        this.plugin.logger.debug(`Toggle changed for ${name}: ${value}`);
                        if (value) {
                            buttonContainer.add(location);
                        } else {
                            buttonContainer.delete(location);
                        }
                        this.plugin.logger.debug(`Updated button container:`, Array.from(buttonContainer));
                        await this.plugin.saveSettings();
                        this.publishToggleVisibilityEvent(buttonId, this.app.workspace, this.publisher);
                        this.plugin.logger.debug(`Toggle visibility event published for ${buttonId}`);
                    })
            })
    }
    /**
     * Publishes a toggle button visibility event using the specified event publisher.
     * @param id The identifier of the button for which visibility is toggled.
     * @param emitter The event emitter responsible for triggering the event.
     * @param publisher The event publisher used to publish the event.
     */
    publishToggleVisibilityEvent(id: ButtonID, emitter: Events, publisher: OpenAPIRendererEventPublisher): void {
        const event = {
            eventID: eventID.ToggleButtonVisibility,
            timestamp: new Date(),
            publisher: eventPublisher.Settings,
            subject: Subject.Button,
            emitter: emitter,
            data: {
                buttonID: id,
            }
        } as ToggleButtonVisibilityEvent;
        publisher.publish(event)
    }
}



