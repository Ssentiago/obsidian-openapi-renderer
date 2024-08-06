export enum eventID {
    ToggleButtonVisibility = 'toggle-button-visibility',
    ServerChangedState = 'openapi-renderer-server-started',
    PowerOff = 'openapi-renderer-power-off',
    SourceThemeState = 'openapi-renderer-theme-state',
    EditorChanged = 'openapi-renderer-editor-changed',
    PreviewThemeState = 'openapi-renderer-preview-theme-state-changed',
    LiveModeChangeState = 'openapi-renderer-live-mode-change-state',
    SwitchModeState = 'openapi-renderer-switch-mode',
}

export enum eventPublisher {
    App = 'app',
    Plugin = 'plugin',
    Settings = 'settings',
    Editor = 'editor',
    OpenAPIView = 'view',
}

export enum Subject {
    Button = 'button',
    Plugin = 'plugin',
    App = 'app',
    All = 'all-classes',
    Preview = 'preview',
    Editor = 'editor',
}

export enum ButtonLocation {
    Ribbon = 'ribbon',
    Toolbar = 'toolbar',
    Statusbar = 'statusbar',
}

export const RENDERER_BUTTON_ID = 'openapi-renderer';
export const REFRESHER_BUTTON_ID = 'openapi-refresher';
export const SERVER_BUTTON_ID = 'openapi-renderer-server';
export const SERVER_ICON_NAME_ON = 'wifi';
export const SERVER_ICON_NAME_OFF = 'wifi-off';

export const enum RESOURCE_NAME {
    BaseCSS = 'swagger-ui-base.css',
    LightThemeCSS = 'swagger-ui-light.css',
    DarkThemeCSS = 'swagger-ui-dark.css',
    SwaggerBundle = 'swagger-ui-bundle.js',
}

export const enum OpenAPIThemeMode {
    dark = 'dark',
    light = 'light',
}

export const enum RenderingMode {
    Source = 'source',
    Preview = 'preview',
    live = 'live',
}
