import { OpenAPIEntryView } from '../OpenAPI-entry-view';
import { WorkerHelper } from 'indexedDB/helper';
import { EntryViewData, MessageType, ResponseType } from 'indexedDB/interfaces';

export class EntryController {
    helper: WorkerHelper;

    constructor(public view: OpenAPIEntryView) {
        this.helper = new WorkerHelper();
    }

    async getEntryViewData(): Promise<EntryViewData[]> {
        const response = await this.helper.sendMessage({
            type: MessageType.GetEntryViewData,
            payload: { data: null },
        });
        if (response.type === ResponseType.Success) {
            return response.payload.data as Array<EntryViewData>;
        }
        return [];
    }
}
