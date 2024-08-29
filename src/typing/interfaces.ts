import {
    App,
    EventRef,
    Events,
    MarkdownPostProcessorContext,
    MarkdownView,
    TextComponent,
    WorkspaceLeaf,
} from 'obsidian';
import { OpenAPIRendererEventsHandler } from 'pluginEvents/eventsHandler';
import OpenAPIPluginContext from '../core/contextManager';
import OpenAPIRendererPlugin from '../core/OpenAPIRendererPlugin';
import { OpenAPIRendererEventPublisher } from '../pluginEvents/eventManager';
import OpenAPIRendererPluginLogger from '../pluginLogging/loggingManager';
import OpenAPIRendererServer from '../server/server';
import { OpenAPISettingTab } from '../settings/settings';
import { ButtonLocation, eventID, eventPublisher, Subject } from './constants';
import { ButtonID, exportType } from './types';

export interface DEFAULT_SETTINGS_Interface {
    serverHostName: string;
    serverPort: number;
    isServerAutoStart: boolean;
    exportType: exportType;
    isResourcesAutoUpdate: boolean;
    OpenAPIPreviewTheme: string;
    synchronizeOpenAPIPreviewTheme: boolean;
    OpenAPISourceThemeMode: string;
    OpenAPISourceLightTheme: string;
    OpenAPISourceDarkTheme: string;
    synchronizeOpenAPISourceTheme: boolean;
    OpenAPIViewDefaultMode: string;
    OpenAPIEntryGridColumns: number;
}

export interface OpenAPIPluginContextInterface {
    app: App;
    plugin: OpenAPIRendererPlugin;
}

export interface OpenAPIRendererPluginInterface {
    settings: DEFAULT_SETTINGS_Interface;
    settingsTab: OpenAPISettingTab;
    appContext: OpenAPIPluginContext;
    eventsHandler: OpenAPIRendererEventsHandler;
    server: OpenAPIRendererServer;
    logger: OpenAPIRendererPluginLogger;

    onload(): Promise<void>;

    onunload(): Promise<void>;

    renderOpenAPI(view: MarkdownView, mode: ''): Promise<void>;

    refreshOpenAPI(view: MarkdownView): Promise<void>;

    showNotice(message: string, duration?: number): void;
}

export interface OpenAPIRendererInterface {
    appContext: OpenAPIPluginContext;

    renderOpenAPIResources(view: MarkdownView, mode: ''): Promise<void>;
}

export interface PreviewHandlerInterface {
    appContext: OpenAPIPluginContext;

    scheduleAutoUpdate(): void;

    previewManualUpdate(view: MarkdownView): void;

    setViewMode(leaf: WorkspaceLeaf, mode: string): Promise<void>;
}

export interface OpenAPIRendererEventsHandlerInterface {
    appContext: OpenAPIPluginContext;

    handleSettingsTabServerPortBlur(
        textComponent: TextComponent
    ): Promise<void>;
}

export interface OpenAPIRendererServerInterface {
    serverAddress: string | undefined;

    start(): Promise<boolean>;

    stop(): Promise<boolean>;

    reload(): Promise<boolean>;

    isRunning(): boolean | undefined;

    isPortAvailable(port: number): Promise<boolean>;
}

export interface OpenAPIMarkdownProcessorInterface {
    appContext: OpenAPIPluginContext;

    registerProcessor(): Promise<void>;

    process(
        source: string,
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext
    ): Promise<void>;

    insertOpenAPIBlock(
        view: MarkdownView,
        htmlFilePath: string,
        specFilePath: string
    ): Promise<void>;
}

export interface OpenAPIRendererPluginLoggerInterface {}

export interface ParsedParams {
    specPath: string;
    width: string;
    height: string;
}

export interface ParseResult {
    success: boolean;
    params: ParsedParams | null;
    error: string | null;
}

export interface Params extends ParsedParams {}

export interface ButtonConfig {
    id: ButtonID;
    icon: string;
    title: string;
    onClick: (ev: MouseEvent) => void | Promise<void>;
    locations: Set<ButtonLocation>;
    htmlElements: Map<ButtonLocation, HTMLElement> | undefined;
    state: (location: ButtonLocation) => boolean;
    buttonType: 'server-button' | 'command-button';
}

export interface UIPluginSettings {
    isCreateServerButton: boolean;
    isCreateCommandButtons: boolean;
    serverButtonLocations: Set<ButtonLocation>;
    renderButtonLocation: Set<ButtonLocation>;
    refreshButtonLocation: Set<ButtonLocation>;
}

export interface OpenAPIRendererEvent {
    eventID: eventID;
    timestamp: Date;
    publisher: eventPublisher;
    subject: Subject;
    emitter: Events;
}

interface ButtonEvent extends OpenAPIRendererEvent {
    data?: Record<string, any>;
}

export interface ToggleButtonVisibilityEvent extends ButtonEvent {
    data: {
        buttonID: ButtonID | null;
    };
}

export interface SettingsTabStateEvent extends OpenAPIRendererEvent {}

export interface ChangeServerStateEvent extends OpenAPIRendererEvent {}

export interface PowerOffEvent extends OpenAPIRendererEvent {}

export interface EditorChangedEvent extends OpenAPIRendererEvent {
    data: {
        leaf: WorkspaceLeaf;
    };
}

export interface SourceThemeStateEvent extends OpenAPIRendererEvent {}

export interface OpenAPIPreviewThemeStateEvent extends OpenAPIRendererEvent {}

export interface LiveModeChangeStateEvent extends OpenAPIRendererEvent {}

export interface SwitchModeStateEvent extends OpenAPIRendererEvent {
    data: {
        leaf: WorkspaceLeaf;
    };
}

export interface ReloadOpenAPIEntryStateEvent extends OpenAPIRendererEvent {}

export interface ChangeGridColumnsStateEvent extends OpenAPIRendererEvent {
    data: {
        value: number;
    };
}

export interface ChangeOpenAPIModeStateEvent extends OpenAPIRendererEvent {}
export interface UpdateOpenAPIViewStateEvent extends OpenAPIRendererEvent {
    data: {
        file: string;
    };
}

export interface ObserverEventData {
    emitter: Events;
    eventRef: EventRef;
}

export interface SettingsSection {
    display(containerEl: HTMLElement): void;
}

export interface SettingSectionParams {
    app: App;
    plugin: OpenAPIRendererPlugin;
    publisher: OpenAPIRendererEventPublisher;
}

export interface LinkedComponentOptions {
    containerEl: HTMLElement;
    name: string;
    desc: string;
    type: 'dropdown' | 'toggle';
    options?: { [key: string]: string };
    setValue: any;
    tooltips: { [key: string]: string };
    onChange?: (value: any) => void;
}

export interface IOpenAPIViewComponent {
    render(): void;

    hide(): void;

    clear(): void;

    close(): void;

    getComponentData(): string;
}
