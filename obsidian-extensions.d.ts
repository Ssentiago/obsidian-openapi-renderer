import { EventRef } from 'obsidian';
import {
    ChangeServerStateEvent,
    PowerOffEvent,
    ToggleButtonVisibilityEvent,
} from './src/typing/interfaces';

import { eventID } from './src/typing/constants';

declare module 'obsidian' {
    interface DataAdapter {
        basePath: string;
    }

    interface Workspace {
        on(
            name: eventID.ToggleButtonVisibility,
            callback: (event: ToggleButtonVisibilityEvent) => any
        ): EventRef;

        trigger(
            name: eventID.ToggleButtonVisibility,
            event: ToggleButtonVisibilityEvent
        ): void;

        on(
            name: eventID.PowerOff,
            callback: (event: PowerOffEvent) => any
        ): EventRef;

        trigger(name: eventID.PowerOff, event: PowerOffEvent): void;

        on(
            name: eventID.ServerChangedState,
            callback: (event: ChangeServerStateEvent) => any
        ): EventRef;
        trigger(
            name: eventID.ServerChangedState,
            event: ChangeServerStateEvent
        ): void;
    }
}
