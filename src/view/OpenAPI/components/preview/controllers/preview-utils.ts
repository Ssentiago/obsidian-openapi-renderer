import path from 'path';
import OpenAPIPreviewController from 'view/OpenAPI/components/preview/controllers/preview-controller';
import yaml from 'js-yaml';
import { eventID } from 'typing/constants';
import { SettingsModal } from 'view/OpenAPI/modals/mode-settings-modal';

export class PreviewUtils {
    constructor(private controller: OpenAPIPreviewController) {}

    async initSwaggerUIBundle(): Promise<void> {
        if (this.controller.swaggerUIBundle) {
            return;
        }
        const pluginDir = this.controller.preview.plugin.manifest.dir;
        if (!pluginDir) {
            throw new Error('No plugin dir found');
        }

        const assetsPath = path.join(
            pluginDir,
            'assets',
            'swagger-ui',
            'swagger-ui-bundle.js'
        );

        try {
            const swaggerContent =
                await this.controller.preview.plugin.app.vault.adapter.read(
                    assetsPath
                );
            this.controller.swaggerUIBundle = new Function(
                `${swaggerContent}
                    return SwaggerUIBundle;`
            )();
        } catch (error: any) {
            this.controller.preview.plugin.logger.error(
                'Error initializing SwaggerUIBundle:',
                error.message
            );
            this.controller.preview.plugin.showNotice(
                'Failed to initialize SwaggerUI. Please check the logs for details.'
            );
        }
    }

    async loadSpec(): Promise<object | null> {
        const file = this.controller.preview.openAPIView.file;
        if (!file) {
            return null;
        }
        const data = this.controller.preview.openAPIView.data;

        let spec: any;
        switch (file.extension) {
            case 'yaml':
            case 'yml':
                spec = yaml.load(data);
                break;
            case 'json':
                spec = JSON.parse(data);
                break;
            default:
                throw new Error(
                    `Unsupported file extension: ${file.extension}`
                );
        }
        return spec;
    }

    initializeActions(): void {
        const { plugin } = this.controller.preview.openAPIView;
        const view = this.controller.preview.openAPIView;

        view.modifiedAddAction('settings', 'Settings', () =>
            new SettingsModal(plugin.app, plugin, 'Preview').open()
        );

        view.modifiedAddAction(
            this.controller.themeManager.getThemeButtonIcon(),
            'Theme',
            async () => {
                this.controller.themeManager.toggleThemeManually();
                await this.controller.themeManager.requestPreviewThemeChange();
            }
        );

        view.modifiedAddAction('file-stack', 'Version history', () => {});

        view.modifiedAddAction('save', 'Save current version', () => {});
    }

    setupEventListeners(): void {
        const { plugin } = this.controller.preview.openAPIView;
        plugin.observer.subscribe(
            plugin.app.workspace,
            eventID.EditorChanged,
            async () => {
                this.controller.preview.cachedPreview = null;
            }
        );

        this.controller.preview.plugin.app.workspace.on(
            'css-change',
            async () => {
                if (
                    this.controller.preview.plugin.settings
                        .synchronizeOpenAPIPreviewTheme
                ) {
                    await this.controller.themeManager.syncWithObsidian();
                }
            }
        );

        plugin.observer.subscribe(
            plugin.app.workspace,
            eventID.PreviewThemeState,
            async () => {
                if (plugin.settings.synchronizeOpenAPIPreviewTheme) {
                    await this.controller.themeManager.syncWithObsidian();
                } else {
                    const mode = plugin.settings.OpenAPIPreviewTheme;
                    this.controller.preview.currentThemeMode = mode;
                    this.controller.preview.currentThemeCSS =
                        this.controller.themeManager.getPreviewCurrentThemeByMode(
                            mode
                        );
                    await this.controller.renderManager.rerender();
                }
            }
        );
    }
}
