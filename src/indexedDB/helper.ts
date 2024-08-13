import { WorkerMessage, WorkerResponse } from './interfaces';
import Worker from 'web-worker:./worker/db-worker.ts';

export class WorkerHelper {
    private worker: Worker;

    constructor() {
        this.worker = new Worker();
    }

    sendMessage(message: WorkerMessage): Promise<WorkerResponse> {
        return new Promise((resolve, reject) => {
            this.worker.onmessage = (
                event: MessageEvent<WorkerResponse>
            ): void => {
                resolve(event.data);
            };

            this.worker.onerror = (error): void => {
                reject(error);
            };

            this.worker.postMessage(message);
        });
    }

    terminateWorker(): void {
        this.worker.terminate();
        this.worker = null as any;
    }
}
