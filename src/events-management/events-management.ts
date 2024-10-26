import OpenAPIRendererPlugin from 'core/openapi-renderer-plugin';
import { EventID } from 'events-management/typing/constants';
import { OpenAPIRendererEvent } from 'events-management/typing/interfaces';
import { Events, View } from 'obsidian';

/**
 * Abstract class representing a Publisher.
 */
abstract class Publisher {
    constructor(public plugin: OpenAPIRendererPlugin) {}

    /**
     * Abstract method to publish an OpenAPiRenderer event.
     * @param event - The OpenAPiRendererEvent object to publish.
     * @typeparam T - The specific type of OpenAPiRendererEvent being published.
     */
    abstract publish<T extends OpenAPIRendererEvent>(
        event: OpenAPIRendererEvent
    ): void;
}

/**
 * Publisher for OpenAPiRenderer eventHandlers.
 */
export class EventPublisher extends Publisher {
    constructor(plugin: OpenAPIRendererPlugin) {
        super(plugin);
    }

    /**
     * Publishes an OpenAPiRenderer event.
     * @param event - the OpenAPiRendererEvent object.
     */
    public publish(event: OpenAPIRendererEvent): void {
        event.emitter.trigger(event.eventID, event);
    }
}

/**
 * Abstract class representing an Observer.
 */
abstract class Observer {
    protected constructor(public plugin: OpenAPIRendererPlugin) {}

    /**
     * Abstract method to subscribe to an OpenAPiRenderer event.
     * @param emitter - The event emitter object.
     * @param eventID - The ID of the event to subscribe to.
     * @param handler - The asynchronous callback function to handle the event.
     * @typeparam T - The type of OpenAPiRendererEvent being subscribed to.
     */
    abstract subscribe<T extends OpenAPIRendererEvent>(
        emitter: Events,
        eventID: EventID,
        handler: (event: T) => Promise<void>
    ): void;
}

/**
 * Observer for handling OpenAPiRenderer eventHandlers.
 */
export class EventObserver extends Observer {
    private subscriptions: Map<Events, Map<EventID, Array<() => void>>> =
        new Map();

    constructor(plugin: OpenAPIRendererPlugin) {
        super(plugin);
    }

    /**
     * Subscribes to an OpenAPiRenderer event.
     * @param emitter - The event emitter object.
     * @param eventID - The ID of the event to subscribe to.
     * @param handler - The asynchronous callback function to handle the event.
     * @typeparam T - The specific type of OpenAPiRendererEvent being subscribed to.
     */
    subscribe<T extends OpenAPIRendererEvent>(
        emitter: Events,
        eventID: EventID,
        handler: (event: T) => Promise<void>
    ): void {
        const eventRef = emitter.on(eventID, async (...data: unknown[]) => {
            const event = data[0] as OpenAPIRendererEvent;
            await handler(event as T);
        });

        if (!this.subscriptions.has(emitter)) {
            this.subscriptions.set(emitter, new Map());
        }
        const emitterSubs = this.subscriptions.get(emitter)!;

        if (!emitterSubs.has(eventID)) {
            emitterSubs.set(eventID, []);
        }
        emitterSubs.get(eventID)!.push(() => emitter.offref(eventRef));
    }

    /**
     * Subscribes to an event in the context of a specific view.
     * The subscription will be automatically cleaned up when the view is unloaded.
     * @param view - The view context
     * @param emitter - The event emitter object
     * @param eventID - The ID of the event to subscribe to
     * @param handler - The asynchronous callback function to handle the event
     */
    subscribeForView<T extends OpenAPIRendererEvent>(
        view: View,
        emitter: Events,
        eventID: EventID,
        handler: (event: T) => Promise<void>
    ): void {
        this.subscribe(emitter, eventID, handler);
        view.register(() => this.unsubscribeFromEvent(emitter, eventID));
    }

    /**
     * Unsubscribes from all events on all emitters
     */
    unsubscribeAll(): void {
        this.subscriptions.forEach((emitterSubs, emitter) => {
            emitterSubs.forEach((handlers) => {
                handlers.forEach((unsubscribe) => unsubscribe());
            });
        });
        this.subscriptions.clear();
    }

    /**
     * Unsubscribes from all events on a specific emitter
     * @param emitter - The event emitter object
     */
    unsubscribeFromEmitter(emitter: Events): void {
        const emitterSubs = this.subscriptions.get(emitter);
        if (emitterSubs) {
            emitterSubs.forEach((handlers) => {
                handlers.forEach((unsubscribe) => unsubscribe());
            });
            this.subscriptions.delete(emitter);
        }
    }

    /**
     * Unsubscribes from a specific event on a specific emitter
     * @param emitter - The event emitter object
     * @param eventID - The ID of the event to unsubscribe from
     */
    unsubscribeFromEvent(emitter: Events, eventID: EventID): void {
        const emitterSubs = this.subscriptions.get(emitter);
        if (emitterSubs) {
            const handlers = emitterSubs.get(eventID);
            if (handlers) {
                handlers.forEach((unsubscribe) => unsubscribe());
                emitterSubs.delete(eventID);
            }
            if (emitterSubs.size === 0) {
                this.subscriptions.delete(emitter);
            }
        }
    }
}
