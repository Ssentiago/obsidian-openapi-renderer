import { VersionController } from './version-controller';
import { RESOURCE_NAME } from '../../../typing/constants';
import {
    FormData,
    SaveCurrentVersionModal,
} from '../modals/save-current-version-modal';

export class VersionUtils {
    constructor(private controller: VersionController) {}

    async getCombinedCSS(): Promise<string> {
        const { plugin } = this.controller.versionView;
        const baseCSS = await plugin.resourceManager.getCSS(
            RESOURCE_NAME.BaseCSS
        );

        const isDarkMode =
            this.controller.themeController.isObsidianDarkTheme();
        const additionalCSSName = isDarkMode
            ? RESOURCE_NAME.DarkThemeCSS
            : RESOURCE_NAME.LightThemeCSS;
        const additionalCSS =
            await plugin.resourceManager.getCSS(additionalCSSName);

        return baseCSS + additionalCSS;
    }

    async getFormData(): Promise<
        { specName: string; specVersion: string } | undefined
    > {
        const modal = new SaveCurrentVersionModal(
            this.controller.versionView.app
        );
        const formData: FormData = await new Promise<FormData>((resolve) => {
            modal.onClose = (): void => {
                resolve(modal.formData);
            };
            modal.open();
        });

        if (
            formData.specName === undefined ||
            formData.specVersion === undefined
        ) {
            return undefined;
        }

        return {
            specName: formData.specName,
            specVersion: formData.specVersion,
        };
    }

    isLargeChange(diff: any): boolean {
        const analyzeDiff = (obj: any): { changes: number } => {
            if (typeof obj !== 'object' || obj === null) {
                return { changes: 0 };
            }

            let totalChanges = 0;

            for (const key in obj) {
                if (key === '_t' && obj[key] === 'a') {
                    // This is an array, we process it in a special wayм
                    for (const arrayKey in obj) {
                        if (arrayKey !== '_t') {
                            if (Array.isArray(obj[arrayKey])) {
                                if (obj[arrayKey].length === 1) {
                                    // Add
                                    totalChanges++;
                                } else if (
                                    obj[arrayKey].length === 3 &&
                                    obj[arrayKey][2] === 0
                                ) {
                                    // Delete or move
                                    totalChanges++;
                                } else if (obj[arrayKey].length === 2) {
                                    // Change
                                    totalChanges++;
                                }
                            } else if (
                                typeof obj[arrayKey] === 'string' &&
                                obj[arrayKey].startsWith('_')
                            ) {
                                // Move
                                totalChanges++;
                            }
                        }
                    }
                } else if (Array.isArray(obj[key])) {
                    if (obj[key].length === 1) {
                        // Add
                        totalChanges++;
                    } else if (obj[key].length === 3 && obj[key][2] === 0) {
                        // Delete
                        totalChanges++;
                    } else if (obj[key].length === 2) {
                        // Change
                        totalChanges++;
                        totalChanges += analyzeDiff(obj[key][1]).changes;
                    }
                } else if (typeof obj[key] === 'object') {
                    // Recursive analysis of nested objects
                    totalChanges += analyzeDiff(obj[key]).changes;
                }
            }

            return { changes: totalChanges };
        };

        const analysis = analyzeDiff(diff);

        const CHANGES_THRESHOLD = 20;

        return analysis.changes > CHANGES_THRESHOLD;
    }
}
