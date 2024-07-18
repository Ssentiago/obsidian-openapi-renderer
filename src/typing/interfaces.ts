import {App, EventRef, Events, MarkdownPostProcessorContext, MarkdownView, TextComponent, TFile, WorkspaceLeaf} from "obsidian";
import {OpenAPISettingTab} from "../settings/settings";
import {OpenAPIPluginContext} from '../contextManager'
import {OpenAPIRenderer, PreviewHandler} from 'rendering/openAPIRender';
import {OpenAPIRendererEventsHandler} from 'pluginEvents/eventsHandler';
import OpenAPIRendererPlugin from "../main";
import OpenAPIRendererServer from "../server/server";
import OpenAPIMarkdownProcessor from "../rendering/markdownProcessor";
import OpenAPIRendererPluginLogger from "../pluginLogging/loggingManager";
import UIManager from "../UI/UIManager";
import {ButtonID} from "./types";
import {ButtonLocation, eventID, eventPublisher, RenderingMode, Subject} from "./constants";


export interface DEFAULT_SETTINGS_Interface {
    htmlFileName: string,
    openapiSpecFileName: string,
    iframeWidth: string,
    iframeHeight: string,
    isAutoUpdate: boolean,
    serverHostName: string,
    serverPort: number,
    isServerAutoStart: boolean,
    isCreateServerButton: boolean,
    isCreateCommandButtons: boolean,
    serverButtonLocations: Set<ButtonLocation>,
    renderButtonLocation: Set<ButtonLocation>,
    refreshButtonLocation: Set<ButtonLocation>,
    theme: string,
    timeoutUnit: string,
    timeout: number
}


export interface OpenAPIPluginContextInterface {
    app: App;
    plugin: OpenAPIRendererPlugin;
}


export interface OpenAPIRendererPluginInterface {
    settings: DEFAULT_SETTINGS_Interface;
    settingsTab: OpenAPISettingTab;
    appContext: OpenAPIPluginContext;
    openAPI: OpenAPIRenderer;
    previewHandler: PreviewHandler;
    eventsHandler: OpenAPIRendererEventsHandler;
    server: OpenAPIRendererServer;
    markdownProcessor: OpenAPIMarkdownProcessor;
    logger: OpenAPIRendererPluginLogger;
    uiManager: UIManager;

    onload(): Promise<void>;

    onunload(): Promise<void>;

    renderOpenAPI(view: MarkdownView, mode: RenderingMode): Promise<void>;

    refreshOpenAPI(view: MarkdownView): Promise<void>;

    loadSettings(): Promise<void>;

    saveSettings(): Promise<void>;

    showNotice(message: string, duration?: number): void;
}

export interface OpenAPIRendererInterface {
    appContext: OpenAPIPluginContext

    renderOpenAPIResources(view: MarkdownView, mode: RenderingMode): Promise<void>;
}


export interface PreviewHandlerInterface {
    appContext: OpenAPIPluginContext;

    scheduleAutoUpdate(): void;

    previewManualUpdate(view: MarkdownView): void;

    setViewMode(leaf: WorkspaceLeaf, mode: string): Promise<void>;
}

export interface OpenAPIRendererEventsHandlerInterface {
    appContext: OpenAPIPluginContext;

    modifyOpenAPISPec(file: TFile): Promise<void>;

    handleSettingsTabOpenAPISpecBlur(textComponent: TextComponent): Promise<void>;

    handleSettingsTabHTMLFileNameBlur(textComponent: TextComponent): Promise<void>;

    handleSettingsTabIframeWidthBlur(textComponent: TextComponent): Promise<void>;

    handleSettingsTabIframeHeightBlur(textComponent: TextComponent): Promise<void>;

    handleSettingsTabServerPortBlur(textComponent: TextComponent): Promise<void>;

    handleSettingsTabTimeoutBlur(textComponent: TextComponent): Promise<void>;
}

export interface OpenAPIRendererServerInterface {

    start(): Promise<boolean>;

    stop(): Promise<boolean>;

    reload(): Promise<boolean>;

    isRunning(): boolean | undefined;

    isPortAvailable(port: number): Promise<boolean>

    serverAddress: string | undefined;
}


export interface OpenAPIMarkdownProcessorInterface {
    appContext: OpenAPIPluginContext;

    registerProcessor(): Promise<void>;

    process(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): Promise<void>;

    insertOpenAPIBlock(view: MarkdownView, htmlFilePath: string, specFilePath: string): Promise<void>;
}

export interface OpenAPIRendererPluginLoggerInterface {
    appContext: OpenAPIPluginContext;
}


export interface ParseResult {
    success: boolean;
    params: ParsedParams | null;
    error: string | null;
}

export interface ParsedParams {
    specPath: string;
    htmlPath: string;
    width: string;
    height: string;
}

export interface Params extends ParsedParams {

}


export interface ButtonConfig {
    id: ButtonID;
    icon: string;
    title: string;
    onClick: (ev: MouseEvent) => void | Promise<void>;
    locations: Set<ButtonLocation>;
    htmlElements: Map<ButtonLocation, HTMLElement> | undefined
    state: (location: ButtonLocation) => boolean,
    buttonType: 'server-button' | 'command-button'
}


export interface UIPluginSettings {
    isCreateServerButton: boolean;
    isCreateCommandButtons: boolean;
    serverButtonLocations: Set<ButtonLocation>,
    renderButtonLocation: Set<ButtonLocation>,
    refreshButtonLocation: Set<ButtonLocation>,
}

export interface OpenAPIRendererEvent {
    eventID: eventID
    timestamp: Date
    publisher: eventPublisher
    subject: Subject
    emitter: Events;
}

interface ButtonEvent extends OpenAPIRendererEvent {
    data?: Record<string, any>;
}


export interface ToggleButtonVisibilityEvent extends ButtonEvent {
    data: {
        buttonID: ButtonID | null,
    }
}

export interface ChangeServerButtonStateEvent extends ButtonEvent {
    data: {
        buttonID: ButtonID,
    }
}

export interface PowerOffEvent extends OpenAPIRendererEvent {
}


export interface ObserverEventData {
    emitter: Events,
    eventRef: EventRef
}

export interface SettingsSection {
    display(containerEl: HTMLElement): void;
}