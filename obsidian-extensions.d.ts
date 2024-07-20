import {EventRef} from 'obsidian'
import {
    ChangedServerSettingsEvent,
    ChangeServerButtonStateEvent, PowerOffEvent,
    ToggleButtonVisibilityEvent
} from "./src/typing/interfaces";

import {eventID} from "./src/typing/constants";

declare module "obsidian" {
    interface DataAdapter {
        basePath: string;
    }

    interface Workspace {
        on(name: eventID.ToggleButtonVisibility, callback: (event: ToggleButtonVisibilityEvent) => any): EventRef;

        trigger(name: eventID.ToggleButtonVisibility, event: ToggleButtonVisibilityEvent): void;
        
        on(name: eventID.ServerChangedState, callback: (event: ChangeServerButtonStateEvent) => any): EventRef;

        trigger(name: eventID.ServerChangedState, event: ChangeServerButtonStateEvent): void;

        on(name: eventID.PowerOff, callback: (event: PowerOffEvent) => any): EventRef;

        trigger(name: eventID.PowerOff, event: PowerOffEvent): void;

        on(name: eventID.ServerChangedSettings, callback: (event: ChangedServerSettingsEvent) => any): EventRef;
        trigger(name: eventID.ServerChangedSettings, event: ChangedServerSettingsEvent): void;
    }

}