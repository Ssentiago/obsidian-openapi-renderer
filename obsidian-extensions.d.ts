import {EventRef} from 'obsidian'
import {
    ChangeButtonLocationEvent,
    ChangeServerButtonStateEvent, PowerOffEvent,
    ToggleButtonVisibilityEvent
} from "./src/typing/interfaces";
import {eventID} from "./src/typing/types";

declare module "obsidian" {
    interface DataAdapter {
        basePath: string;
    }

    interface Workspace {
        on(name: eventID.ToggleButtonVisibility, callback: (event: ToggleButtonVisibilityEvent) => any): EventRef;

        trigger(name: eventID.ChangeButtonLocation, event: ToggleButtonVisibilityEvent): void;

        on(name: eventID.ChangeButtonLocation, callback: (event: ChangeButtonLocationEvent) => any): EventRef;

        trigger(name: eventID.ChangeButtonLocation, event: ChangeButtonLocationEvent): void;

        on(name: eventID.ServerStarted, callback: (event: ChangeServerButtonStateEvent) => any): EventRef;

        trigger(name: eventID.ServerStarted, event: ChangeServerButtonStateEvent): void;

        on(name: eventID.PowerOff, callback: (event: PowerOffEvent) => any): EventRef;

        trigger(name: eventID.PowerOff, event: PowerOffEvent): void;
    }

}