import { Specification } from 'indexedDB/database/specification';
import {
    MessageType,
    ResponseType,
    SpecParams,
} from 'indexedDB/typing/interfaces';
import { moment } from 'obsidian';
import pako from 'pako';
import { convertData } from 'ui/common/helpers';
import { ModalFormData } from 'ui/views/OpenAPI Version/components/modes/normal/modals/save-current-version-modal/save-current-version-modal';
import { Controller } from 'ui/views/OpenAPI Version/controller/controller';

export default class VersionController {
    constructor(private readonly controller: Controller) {}

    async getVersionHistory(): Promise<Array<Specification> | [] | undefined> {
        const path = this.controller.versionView.file?.path;
        if (!path) {
            return undefined;
        }
        const response =
            await this.controller.versionView.plugin.workerHelper.sendMessage({
                type: MessageType.GetVersions,
                payload: {
                    data: { path: path },
                },
            });
        const specsParams: Array<SpecParams> = response.payload.data;

        if (response.type === ResponseType.Success && specsParams.length > 0) {
            return specsParams.map((spec) => new Specification(spec));
        }
        return [];
    }

    async deleteVersion(id: number): Promise<boolean> {
        const response =
            await this.controller.versionView.plugin.workerHelper.sendMessage({
                type: MessageType.DeleteVersion,
                payload: { data: { id: id } },
            });

        return response.type === 'SUCCESS';
    }

    async restoreVersion(id: number): Promise<boolean> {
        const response =
            await this.controller.versionView.plugin.workerHelper.sendMessage({
                type: MessageType.RestoreVersion,
                payload: { data: { id: id } },
            });

        return response.type === 'SUCCESS';
    }

    async deleteVersionPermanently(id: number): Promise<boolean> {
        const response =
            await this.controller.versionView.plugin.workerHelper.sendMessage({
                type: MessageType.DeletePermanently,
                payload: { data: { id: id } },
            });

        if (response.type === 'SUCCESS') {
            this.controller.versionView.versions =
                this.controller.versionView.versions.filter(
                    (viewSpec) => viewSpec.id !== id
                );
        }
        return response.type === 'SUCCESS';
    }

    async saveVersion(formData: ModalFormData): Promise<boolean> {
        const view = this.controller.versionView;
        const file = view.file;
        if (!file) {
            return false;
        }

        let diff: string;
        let isFull = false;

        const name = formData.specName;
        const version = formData.specVersion;

        const currentViewData = convertData(view.data, file.extension);

        if (view.versions.length === 0) {
            isFull = true;
            diff = currentViewData;
        } else {
            const fullData = await this.saveVersionCalculateDiff(
                view.versions,
                currentViewData,
                file.path
            );

            if (fullData.diff === null) {
                return false;
            }

            isFull = fullData.isFull;
            diff = fullData.diff;
        }

        const gzippedDiff = pako.gzip(diff);

        const spec = {
            path: file.path,
            name: name,
            diff: gzippedDiff,
            version: version,
            createdAt: moment().toISOString(),
            softDeleted: false,
            isFull: isFull,
        };

        return this.saveVersionSendMessage(spec);
    }

    private async saveVersionCalculateDiff(
        versions: Specification[],
        currentViewData: string,
        filePath: string
    ): Promise<{ diff: null | string; isFull: boolean }> {
        const lastVersion = versions.last() as Specification;
        const old = JSON.parse(
            lastVersion.getPatchedVersion(versions).diff as string
        );
        const _new = JSON.parse(currentViewData);

        const diff = JSON.stringify(
            this.controller.diffController.diff(old, _new)
        );

        if (!diff) {
            this.controller.versionView.plugin.logger.error(
                'No new changes found between previous and current draft version'
            );
            return {
                isFull: false,
                diff: null,
            };
        }

        const shouldBeFull =
            await this.controller.versionView.plugin.workerHelper.sendMessage({
                type: MessageType.IsNextVersionFull,
                payload: { data: { path: filePath } },
            });

        return {
            isFull:
                shouldBeFull.type === 'SUCCESS' && shouldBeFull.payload.data,
            diff: diff,
        };
    }

    private async saveVersionSendMessage(
        spec: Record<string, any>
    ): Promise<boolean> {
        try {
            const result =
                await this.controller.versionView.plugin.workerHelper.sendMessage(
                    {
                        type: MessageType.AddVersion,
                        payload: { data: { spec: spec } },
                    }
                );

            if (result.type === 'SUCCESS') {
                const response =
                    await this.controller.versionView.plugin.workerHelper.sendMessage(
                        {
                            type: MessageType.GetLastVersion,
                            payload: {
                                data: { path: spec.path },
                            },
                        }
                    );
                if (response.type === ResponseType.Success) {
                    const newSpec = new Specification(response.payload.data);
                    this.controller.versionView.versions.push(newSpec);
                }
                return true;
            }

            this.controller.versionView.plugin.logger.error(
                result.payload.data.message
            );
            return false;
        } catch (error: any) {
            this.controller.versionView.plugin.logger.error(error.message);
            return false;
        }
    }
}
