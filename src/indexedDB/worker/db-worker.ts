import { IndexedDB } from '../database/indexedDB';
import { BaseSpecification } from '../database/specification';
import { messageType, responseType, WorkerMessage } from '../interfaces';

const db = new IndexedDB();

self.onmessage = async (event: MessageEvent<WorkerMessage>): Promise<void> => {
    const { type, payload } = event.data;
    try {
        let id: number;
        switch (type) {
            case messageType.AddVersion:
                const spec = new BaseSpecification(payload.spec);
                await db.add(spec);
                self.postMessage({
                    type: responseType.Success,
                });

                break;
            case messageType.GetVersions:
                const path = payload.path;
                if (!path) {
                    return;
                }
                const versions = await db.getVersions(path);
                self.postMessage({
                    type: responseType.Success,
                    payload: { data: versions },
                });
                break;
            case messageType.GetLastVersion:
                const lastVersion = await db.getLastVersion(payload.path);
                self.postMessage({
                    type: responseType.Success,
                    payload: { data: lastVersion },
                });
                break;
            case messageType.DeleteVersion:
                id = parseInt(payload.id, 10);
                await db.deleteVersion(id);
                self.postMessage({
                    type: responseType.Success,
                    payload: null,
                });
                break;
            case messageType.RestoreVersion:
                id = parseInt(payload.id, 10);
                await db.restoreVersion(id);
                self.postMessage({
                    type: responseType.Success,
                    payload: null,
                });
                break;
            case messageType.DeletePermanently:
                id = parseInt(payload.id, 10);
                await db.deleteVersionPermanently(id);
                self.postMessage({
                    type: responseType.Success,
                    payload: null,
                });
                break;
            case messageType.IsNextVersionFull:
                const fPath = payload.path;
                const isNextVersionFull = await db.isNextVersionFull(fPath);
                self.postMessage({
                    type: responseType.Success,
                    payload: { data: isNextVersionFull },
                });
                break;
            default:
                self.postMessage({
                    type: responseType.Error,
                    payload: { message: `Unknown message type: ${type}` },
                });
        }
    } catch (err: any) {
        self.postMessage({
            type: responseType.Error,
            payload: { message: err.message },
        });
    }
};
