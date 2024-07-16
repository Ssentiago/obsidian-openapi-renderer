import {Params, ParsedParams} from "./interfaces";


export enum ButtonLocation {
    Ribbon = 'ribbon',
    Toolbar = 'toolbar',
    Statusbar = 'statusbar'
}


export const RENDERER_BUTTON_ID = 'openapi-renderer';
export const REFRESHER_BUTTON_ID = 'openapi-refresher';
export const SERVER_BUTTON_ID = 'openapi-renderer-server'

export const SERVER_ICON_NAME_ON = 'wifi'
export const SERVER_ICON_NAME_OFF = 'wifi-off'

export type ButtonID = 'openapi-renderer-server' | 'openapi-renderer' | 'openapi-refresher'

export type IframeCreator = (params: ParsedParams | Params) => HTMLIFrameElement;


export enum RenderingMode {
    'Inline' = 'inline',
    'Modal' = 'modal'
}

export const ButtonState = {
    Visible: true,
    Hidden: false
} as const;
export type ButtonStateType = typeof ButtonState[keyof typeof ButtonState];


export enum eventID {
    ToggleButtonVisibility = 'toggle-button-visibility',
    ServerStarted = 'openapi-renderer-server-started',
    PowerOff = 'openapi-renderer-power-off'
}

export enum eventPublisher {
    App = 'app',
    Plugin = 'plugin',
    Settings = 'settings'
}

export enum Subject {
    Button = 'button',
    Plugin = 'plugin',
    App = 'app',
    classes = 'classes'
}

