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
        const eventRef = emitter.on(eventID, async (event: OpenAPIRendererEvent) => await handler(event as T)
        );
        this.subscriptions.add({emitter: emitter, eventRef: eventRef} as ObserverEventData);
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
            this.onunload.bind(this)
        )
        this.logEvents()
    }

    async onunload() {
        this.unsubscribeAll()
    }

    logEvents() {
        Object.values(eventID).forEach(id => {
            this.register(this.appContext.app.workspace, id, async (event: OpenAPIRendererEvent) => {
                console.warn(`Got event with id: ${event.eventID}. Subject of event is: ${event.subject}. Publisher of event is ${event.publisher}`)


            });
        });
    }


    subscribe<T extends OpenAPIRendererEvent>(emitter: Events, eventID: eventID, handler: (event: T) => Promise<void>): void {
        this.register(emitter, eventID, handler);
        console.log(this.subscriptions)
    }

    unsubscribeAll() {
        this.subscriptions.forEach(subscription => {
            this.unregister(subscription.emitter, subscription.eventRef);
        });
        this.subscriptions.clear();
    }
}

