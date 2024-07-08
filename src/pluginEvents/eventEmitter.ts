import {EventRef, Events} from "obsidian";
import {OpenAPIPluginContext} from "../contextManager";
import {eventID} from "../typing/types";
import {ObserverEventData, OpenAPIRendererEvent} from "../typing/interfaces";


abstract class Publisher {
    appContext: OpenAPIPluginContext

    constructor(appContext: OpenAPIPluginContext) {
        this.appContext = appContext;
    }

    abstract publish<T extends OpenAPIRendererEvent>(event: OpenAPIRendererEvent): void
}

abstract class Observer {
    appContext: OpenAPIPluginContext;
    protected subscriptions: Set<ObserverEventData>;

    constructor(appContext: OpenAPIPluginContext) {
        this.appContext = appContext
        this.subscriptions = new Set();
    }

    protected register<T extends OpenAPIRendererEvent>(emitter: Events, eventID: eventID, handler: (event: T) => Promise<void>): void {
        const eventRef = emitter.on(eventID, (event: OpenAPIRendererEvent) => handler(event as T));
        // todo key will be subject
        this.subscriptions.add({emitter: emitter, eventRef: eventRef} as ObserverEventData);
        this.appContext.plugin.registerEvent(eventRef);
    }

    protected unregister(emitter: Events, eventRef: EventRef): void {
        emitter.offref(eventRef)
    }
}

export class OpenAPIRendererEventPublisher extends Publisher {
    constructor(appContext: OpenAPIPluginContext) {
        super(appContext);
    }


    public publish(event: OpenAPIRendererEvent): void {
        event.emitter.trigger(event.eventID, event)
    }
}


export class OpenAPIRendererEventObserver extends Observer {
    constructor(appContext: OpenAPIPluginContext) {
        super(appContext);
        this.subscribe(
            this.appContext.app.workspace,
            eventID.PowerOff,
            this.onunload
        )
    }

   async onunload() {
        this.unsubscribeAll()
    }


    subscribe<T extends OpenAPIRendererEvent>(emitter: Events, eventID: eventID, handler: (event: T) => Promise<void>): void {
        this.register(emitter, eventID, handler);
    }

    unsubscribeAll() {
        this.subscriptions.forEach(subscription => {
            this.unregister(subscription.emitter, subscription.eventRef);
        });
        this.subscriptions.clear();
    }
}

