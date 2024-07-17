import {EventRef, Events} from "obsidian";
import {OpenAPIPluginContext} from "../contextManager";
import {ObserverEventData, OpenAPIRendererEvent} from "../typing/interfaces";
import {eventID} from "../typing/constants";


/**
 * Abstract class representing a Publisher.
 */
abstract class Publisher {
    appContext: OpenAPIPluginContext

    protected constructor(appContext: OpenAPIPluginContext) {
        this.appContext = appContext;
    }

    /**
     * Abstract method to publish an OpenAPI event.
     * @param event - The OpenAPIRendererEvent object to publish.
     * @typeparam T - The specific type of OpenAPIRendererEvent being published.
     */
    abstract publish<T extends OpenAPIRendererEvent>(event: OpenAPIRendererEvent): void
}

/**
 * Publisher for OpenAPI Renderer events.
 */
export class OpenAPIRendererEventPublisher extends Publisher {
    constructor(appContext: OpenAPIPluginContext) {
        super(appContext);
    }

    /**
     * Publishes an OpenAPI Renderer event.
     * @param event - The OpenAPIRendererEvent object.
     */
    public publish(event: OpenAPIRendererEvent): void {
        event.emitter.trigger(event.eventID, event)
    }
}

/**
 * Abstract class representing an Observer.
 */
abstract class Observer {
    appContext: OpenAPIPluginContext;
    protected subscriptions: Set<ObserverEventData>;

    protected constructor(appContext: OpenAPIPluginContext) {
        this.appContext = appContext
        this.subscriptions = new Set();
    }

    /**
     * Abstract method to subscribe to an OpenAPI event.
     * @param emitter - The event emitter object.
     * @param eventID - The ID of the event to subscribe to.
     * @param handler - The asynchronous callback function to handle the event.
     * @typeparam T - The type of OpenAPIRendererEvent being subscribed to.
     */
    abstract subscribe<T extends OpenAPIRendererEvent>(emitter: Events, eventID: eventID, handler: (event: T) => Promise<void>): void

    /**
     * Abstract method to unsubscribe from an OpenAPI event.
     * @param emitter - The event emitter object.
     * @param eventRef - The reference or identifier of the event to unsubscribe from.
     */
    abstract unsubscribe(emitter: Events, eventRef: EventRef): void
}

/**
 * Observer for handling OpenAPI Renderer events.
 */
export class OpenAPIRendererEventObserver extends Observer {
    constructor(appContext: OpenAPIPluginContext) {
        super(appContext);
        this.subscribe(
            this.appContext.app.workspace,
            eventID.PowerOff,
            this.onunload.bind(this)
        )
    }

    /**
     * Asynchronous method called when unloading.
     * Unsubscribes from all events.
     */
    private async onunload() {
        this.unsubscribeAll()
    }

    /**
     * Subscribes to an OpenAPI event.
     * @param emitter - The event emitter object.
     * @param eventID - The ID of the event to subscribe to.
     * @param handler - The asynchronous callback function to handle the event.
     * @typeparam T - The specific type of OpenAPIRendererEvent being subscribed to.
     */
    subscribe<T extends OpenAPIRendererEvent>(emitter: Events, eventID: eventID, handler: (event: T) => Promise<void>): void {
        const eventRef = emitter.on(eventID,
            async (event: OpenAPIRendererEvent) => await handler(event as T));

        this.subscriptions.add({emitter: emitter, eventRef: eventRef} as ObserverEventData);
    }

    /**
     * Unsubscribes from an OpenAPI event.
     * @param emitter - The event emitter object.
     * @param eventRef - The reference or identifier of the event to unsubscribe from.
     */
    unsubscribe(emitter: Events, eventRef: EventRef) {
        emitter.offref(eventRef)
    }

    /**
     * Unsubscribes from all subscribed events.
     * Clears all subscriptions.
     */
    unsubscribeAll() {
        this.subscriptions.forEach(subscription => {
            this.unsubscribe(subscription.emitter, subscription.eventRef);
        });
        this.subscriptions.clear();
    }
}

