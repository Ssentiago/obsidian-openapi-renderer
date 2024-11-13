import { DiffController } from 'view/views/OpenAPI Version/controller/controllers/diff-controller';
import VersionController from 'view/views/OpenAPI Version/controller/controllers/version-controller';
import { VersionUtils } from 'view/views/OpenAPI Version/controller/controllers/versionUtils';
import { VersionView } from 'view/views/OpenAPI Version/version-view';

export class Controller {
    versionController: VersionController;
    versionUtils: VersionUtils;
    diffController: DiffController;

    constructor(public versionView: VersionView) {
        this.versionController = new VersionController(this);
        this.versionUtils = new VersionUtils(this);
        this.diffController = new DiffController();
        this.initializeActions();
    }

    initializeActions(): void {
        this.versionView.addAction(
            'download',
            'Export all versions of this file as a ZIP archive',
            async () => {
                await this.versionView.plugin.export.export(
                    this.versionView.versions
                );
                this.versionView.plugin.showNotice('Exported successfully');
            }
        );
    }
}
