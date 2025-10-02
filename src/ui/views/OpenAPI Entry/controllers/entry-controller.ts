import { WorkerHelper } from 'indexedDB/worker/helper';
import {
    EntryViewData,
    MessageType,
    ResponseType,
    SpecParams,
} from 'indexedDB/typing/interfaces';
import { Specification } from 'indexedDB/database/specification';

import { EntryView } from 'ui/views/OpenAPI Entry/entry-view';

export class EntryController {
    helper: WorkerHelper;

    constructor(public view: EntryView) {
        this.helper = new WorkerHelper();
    }

    async getEntryViewData(): Promise<EntryViewData> {
        const response = await this.helper.sendMessage({
            type: MessageType.GetEntryViewData,
            payload: { data: null },
        });
        if (response.type === ResponseType.Success) {
            return response.payload.data as EntryViewData;
        }
        return {};
    }

    async deleteFile(path: string): Promise<boolean> {
        const response = await this.helper.sendMessage({
            type: MessageType.DeleteFile,
            payload: {
                data: {
                    path: path,
                },
            },
        });
        return response.type === 'SUCCESS';
    }

    /**
     * Retrieves all versions of a file from the helper.
     *
     * @param {string} path - The path of the file to retrieve versions for.
     * @return {Array<Specification>} An array of specifications representing the file versions.
     */
    async getAllVersionsForFile(path: string): Promise<Specification[] | null> {
        const response = await this.helper.sendMessage({
            type: MessageType.GetVersions,
            payload: {
                data: {
                    path: path,
                },
            },
        });
        if (response.type === 'SUCCESS') {
            const specs = response.payload.data as Array<SpecParams>;
            return specs.map((spec) => new Specification(spec));
        }
        return null;
    }

    /**
     * Retrieves all export data from the helper and returns it as a record of specifications.
     *
     * @return {Record<string, Specification[]> | undefined} A record of specifications where each key is a path and each value is an array of specifications.
     */
    async getAllTheExportData(): Promise<
        Record<string, Specification[]> | undefined
    > {
        const response = await this.helper.sendMessage({
            type: MessageType.GetAllData,
            payload: {
                data: null,
            },
        });
        if (response.type === 'SUCCESS') {
            const specs = response.payload.data as Array<SpecParams>;
            return specs.reduce<Record<string, Specification[]>>(
                (acc, spec) => {
                    if (!acc[spec.path]) {
                        acc[spec.path] = [];
                    }
                    acc[spec.path].push(new Specification(spec));
                    return acc;
                },
                {}
            );
        }
        return undefined;
    }

    async exportAllData() {
        const allData = await this.getAllTheExportData();
        debugger;

        if (!allData) {
            this.view.plugin.showNotice('Cannot export data. Check the logs');
            return;
        }

        if (Object.keys(allData).length === 0) {
            this.view.plugin.showNotice(
                'No data to export yet. Save something first!'
            );
            return;
        }

        await this.view.plugin.export.export(allData);
        this.view.plugin.showNotice('Exported successfully');
    }
}
