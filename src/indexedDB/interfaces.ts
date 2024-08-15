export enum MessageType {
    AddVersion = 'add-version',
    GetVersions = 'get-versions',
    GetLastVersion = 'get-last-version',
    DeleteVersion = 'delete-version',
    RestoreVersion = 'restore-version',
    DeletePermanently = 'delete-version-permanently',
    IsNextVersionFull = 'is-next-version-full',
    GetEntryViewData = 'get-entry-view-data',
}

export const enum ResponseType {
    Success = 'SUCCESS',
    Error = 'ERROR',
}

interface Payload {
    data: any;
}

export interface WorkerMessage {
    type: MessageType;
    payload: Payload;
}

export interface WorkerResponse {
    type: ResponseType;
    payload: Payload;
}

export interface EntryViewData {
    path: string;
    versionCount: number;
    lastUpdatedAt: string;
}
