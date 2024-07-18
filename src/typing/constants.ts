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

export enum RenderingMode {
    'Inline' = 'inline',
    'Modal' = 'modal'
}

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