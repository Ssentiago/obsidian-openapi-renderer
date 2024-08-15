import { OpenAPIEntryView } from '../OpenAPI-entry-view';
import { WorkerHelper } from 'indexedDB/helper';
import { EntryViewData, MessageType, ResponseType } from 'indexedDB/interfaces';
import { SettingsOpenapiEntryModal } from '../modals/settings-openapi-entry-modal';

export class EntryController {
    helper: WorkerHelper;

    constructor(public view: OpenAPIEntryView) {
        this.helper = new WorkerHelper();
        this.initializeActions();
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

    initializeActions(): void {
        this.view.addAction('gear', 'Settings', () => {
            new SettingsOpenapiEntryModal(
                this.view.app,
                this.view.plugin
            ).open();
        });
    }
}
