import OpenAPIRendererPlugin from '../core/OpenAPIRendererPlugin';
import { WorkerHelper } from '../indexedDB/helper';
import { TAbstractFile } from 'obsidian';
import { MessageType } from '../indexedDB/interfaces';
import { eventID, eventPublisher, Subject } from '../typing/constants';
import { ReloadOpenAPIEntryStateEvent } from '../typing/interfaces';

export class FileWatcher {
    helper: WorkerHelper;

    constructor(public plugin: OpenAPIRendererPlugin) {
        this.helper = new WorkerHelper();
        this.startWatching();
    }

    startWatching(): void {
        this.plugin.app.vault.on(
            'rename',
            async (file: TAbstractFile, oldPath: string) => {
                const isFileTracked = await this.helper.sendMessage({
                    type: MessageType.IsFileTracked,
                    payload: {
                        data: {
                            path: oldPath,
                        },
                    },
                });
                if (
                    isFileTracked.type === 'SUCCESS' &&
                    isFileTracked.payload.data
                ) {
                    const response = await this.helper.sendMessage({
                        type: MessageType.RenameFile,
                        payload: {
                            data: {
                                oldPath: oldPath,
                                newPath: file.path,
                            },
                        },
                    });
                    if (response.type === 'ERROR') {
                        this.plugin.logger.error(response.payload.data.message);
                        return;
                    }
                    this.plugin.publisher.publish({
                        eventID: eventID.ReloadOpenAPIEntryState,
                        subject: Subject.All,
                        publisher: eventPublisher.Settings,
                        emitter: this.plugin.app.workspace,
                        timestamp: new Date(),
                    } as ReloadOpenAPIEntryStateEvent);
                }
            }
        );
    }
}
