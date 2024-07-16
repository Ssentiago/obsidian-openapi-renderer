import {EventRef} from 'obsidian'
import {
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

        trigger(name: eventID.ToggleButtonVisibility, event: ToggleButtonVisibilityEvent): void;
        
        on(name: eventID.ServerStarted, callback: (event: ChangeServerButtonStateEvent) => any): EventRef;

        trigger(name: eventID.ServerStarted, event: ChangeServerButtonStateEvent): void;

        on(name: eventID.PowerOff, callback: (event: PowerOffEvent) => any): EventRef;

        trigger(name: eventID.PowerOff, event: PowerOffEvent): void;
    }

}