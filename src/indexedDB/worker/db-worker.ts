import { IndexedDB } from '../database/indexedDB';
import { BaseSpecification } from '../database/specification';
import { MessageType, ResponseType, WorkerMessage } from '../interfaces';

const db = new IndexedDB();

self.onmessage = async (event: MessageEvent<WorkerMessage>): Promise<void> => {
    const { type, payload } = event.data;
    try {
        let id: number;
        switch (type) {
            case MessageType.AddVersion:
                const spec = new BaseSpecification(payload.data.spec);
                await db.add(spec);
                self.postMessage({
                    type: ResponseType.Success,
                });

                break;
            case MessageType.GetVersions:
                const path = payload.data.path;
                if (!path) {
                    return;
                }
                const versions = await db.getVersions(path);
                self.postMessage({
                    type: ResponseType.Success,
                    payload: { data: versions },
                });
                break;
            case MessageType.GetLastVersion:
                const lastVersion = await db.getLastVersion(payload.data.path);
                self.postMessage({
                    type: ResponseType.Success,
                    payload: { data: lastVersion },
                });
                break;
            case MessageType.DeleteVersion:
                id = parseInt(payload.data.id, 10);
                await db.deleteVersion(id);
                self.postMessage({
                    type: ResponseType.Success,
                    payload: null,
                });
                break;
            case MessageType.RestoreVersion:
                id = parseInt(payload.data.id, 10);
                await db.restoreVersion(id);
                self.postMessage({
                    type: ResponseType.Success,
                    payload: null,
                });
                break;
            case MessageType.DeletePermanently:
                id = parseInt(payload.data.id, 10);
                await db.deleteVersionPermanently(id);
                self.postMessage({
                    type: ResponseType.Success,
                    payload: null,
                });
                break;
            case MessageType.IsNextVersionFull:
                const fPath = payload.data.path;
                const isNextVersionFull = await db.isNextVersionFull(fPath);
                self.postMessage({
                    type: ResponseType.Success,
                    payload: { data: isNextVersionFull },
                });
                break;
            default:
                self.postMessage({
                    type: ResponseType.Error,
                    payload: { message: `Unknown message type: ${type}` },
                });
        }
    } catch (err: any) {
        self.postMessage({
            type: ResponseType.Error,
            payload: { message: err.message },
        });
    }
};
