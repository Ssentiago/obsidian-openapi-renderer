import OpenAPIPreviewController from 'view/OpenAPI/components/preview/controllers/preview-controller';
import yaml from 'js-yaml';
import { eventID } from 'typing/constants';
import { setIcon } from 'obsidian';

export class PreviewUtils {
    constructor(private controller: OpenAPIPreviewController) {}

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

        const themeButton = view.addAction(
            this.controller.themeManager.getThemeButtonIcon(),
            'Theme',
            async () => {
                this.controller.themeManager.toggleThemeManually();
                await this.controller.themeManager.requestPreviewThemeChange();
                setIcon(
                    themeButton,
                    this.controller.themeManager.getThemeButtonIcon()
                );
            }
        );
        plugin.observer.subscribe(
            plugin.app.workspace,
            eventID.PreviewThemeState,
            async () => {
                setIcon(
                    themeButton,
                    this.controller.themeManager.getThemeButtonIcon()
                );
            }
        );
        plugin.observer.subscribe(
            plugin.app.workspace,
            eventID.SwitchModeState,
            async () => {
                themeButton.remove();
            }
        );
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
