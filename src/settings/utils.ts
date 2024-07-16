import {ButtonID, ButtonLocation, eventID, eventPublisher, Subject} from "../typing/types";
import {App, Events, Setting} from "obsidian";
import {OpenAPIRendererEventPublisher} from "../pluginEvents/eventEmitter";
import {ToggleButtonVisibilityEvent} from "../typing/interfaces";
import OpenAPIRendererPlugin from "../main";

export class SettingsUtils {
    app: App
    plugin: OpenAPIRendererPlugin
    publisher: OpenAPIRendererEventPublisher

    constructor(app: App, plugin: OpenAPIRendererPlugin, publisher: OpenAPIRendererEventPublisher) {
        this.app = app;
        this.plugin = plugin;
        this.publisher = publisher
    }

    createLocationToggle(container: HTMLElement,
                         name: string,
                         location: ButtonLocation,
                         buttonId: ButtonID,
                         buttonContainer: Set<ButtonLocation>) {
        return new Setting(container)
            .setName(name)
            .addToggle(toggle => {
                toggle.setValue(this.plugin.settings.serverButtonLocations.has(location))
                    .onChange(async (value) => {
                        value ?
                            buttonContainer.add(location)
                            : buttonContainer.delete(location)
                        await this.plugin.saveSettings()
                        this.publishToggleVisibilityEvent(buttonId, this.app.workspace, this.publisher)
                    })
            });
    }

    publishToggleVisibilityEvent(id: ButtonID, emitter: Events, publisher: OpenAPIRendererEventPublisher) {
        console.log('published')
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



