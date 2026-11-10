import { EventRef, Events, WorkspaceLeaf } from 'obsidian';

import { EventID } from './constants';

export interface OpenAPIRendererEvent {
    eventID: EventID;
    timestamp: Date;
    emitter: Events;
}

export type SettingsTabStateEvent = OpenAPIRendererEvent;

export type PowerOffEvent = OpenAPIRendererEvent;

export interface SourceChangedEvent extends OpenAPIRendererEvent {
    data: {
        file: string;
    };
}

export interface OpenAPIThemeChangeState extends OpenAPIRendererEvent {
    data: {
        mode: 'source' | 'preview';
    };
}

export interface SwitchModeStateEvent extends OpenAPIRendererEvent {
    data: {
        leaf: WorkspaceLeaf;
    };
}

export interface PreviewStateEvent extends OpenAPIRendererEvent {
    data: {
        state: 'full' | 'fast';
    };
}

export type ReloadOpenAPIEntryStateEvent = OpenAPIRendererEvent;

export interface ChangeGridColumnsStateEvent extends OpenAPIRendererEvent {
    data: {
        value: number;
    };
}

export interface UpdateOpenAPIViewStateEvent extends OpenAPIRendererEvent {
    data: {
        file: string;
    };
}

export interface ObserverEventData {
    emitter: Events;
    eventRef: EventRef;
}
