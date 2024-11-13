import { Extension } from '@codemirror/state';
import { isObsidianDarkTheme } from 'view/common/helpers';
import { RenderingMode } from 'view/typing/constants';
import { themes } from 'view/views/OpenAPI/components/source/extensions/themes';
import { SourceController } from 'view/views/OpenAPI/components/source/controllers/source-controller';

export class ThemeController {
    constructor(private readonly controller: SourceController) {}

    /**
     * Initializes the theme of the editor.
     *
     * If the `syncOpenAPISourceTheme` setting is enabled, the theme of the
     * editor is synchronized with Obsidian's theme mode.
     *
     * Otherwise, the theme of the editor is set to the value of the
     * `OpenAPISourceThemeMode` setting.
     *
     * @returns {void} No return value.
     */
    initializeTheme(): void {
        if (this.controller.source.plugin.settings.syncOpenAPISourceTheme) {
            this.toggleThemeFollowObsidian();
        } else {
            const { settings } = this.controller.source.plugin;
            this.controller.source.themeMode = settings.OpenAPISourceThemeMode;
            const theme = this.getEditorCurrentThemeByMode(
                settings.OpenAPISourceThemeMode
            );
            if (theme) {
                this.controller.source.currentTheme = theme;
            }
        }
    }

    /**
     * This method retrieves and returns the current theme of the editor based on the current theme mode and the settings.
     * @param mode - The current theme mode.
     *
     */
    getEditorCurrentThemeByMode(
        mode: string
    ): { extension: Extension } | readonly Extension[] | undefined {
        const { settings } = this.controller.source.plugin;
        return themes
            .get(mode)
            ?.get(
                mode === 'dark'
                    ? settings.OpenAPISourceDarkTheme
                    : settings.OpenAPISourceLightTheme
            );
    }

    /**
     * Requests a theme update for the editor.
     *
     * This method will be called if the theme of the editor needs to be updated.
     * It will dispatch a reconfiguration of the theme to the editor, if the
     * current view mode is {@link RenderingMode.Source}.
     *
     * @returns {Promise<void>} A promise that resolves when the theme update is complete.
     */
    async requestThemeUpdate(): Promise<void> {
        if (this.controller.source.view.mode === RenderingMode.Source) {
            this.controller.source.editor?.dispatch({
                effects:
                    this.controller.extensionController.themeConfigurator.reconfigure(
                        this.controller.source.currentTheme
                    ),
            });
        }
    }

    /**
     * The icon to use for the theme button.
     *
     * The theme button is used to toggle the theme of the source code editor.
     *
     * If the current theme mode is dark, the icon is `'moon'`. Otherwise, the icon is `'sun'`.
     *
     * @returns {'moon' | 'sun'} The theme button icon.
     */
    get themeButtonIcon(): 'moon' | 'sun' {
        return this.controller.source.themeMode === 'dark' ? 'moon' : 'sun';
    }

    /**
     * Toggles the theme of the source code editor to follow Obsidian's theme mode.
     *
     * This method checks the current theme mode of Obsidian and sets the
     * theme mode of the source code editor to match. If the current theme mode
     * of Obsidian is `'dark'`, the theme mode of the source code editor will be
     * changed to `'dark'`. Otherwise, the theme mode of the source code editor
     * will be changed to `'light'`.
     *
     * @returns {void}
     */
    toggleThemeFollowObsidian(): void {
        const currentMode = isObsidianDarkTheme() ? 'dark' : 'light';
        this.controller.source.themeMode = currentMode;
        const theme = this.getEditorCurrentThemeByMode(currentMode);
        if (theme) {
            this.controller.source.themeMode = currentMode;
            this.controller.source.currentTheme = theme;
        }
    }

    /**
     * Toggles the theme of the source code editor manually.
     *
     * This method will switch the theme of the source code editor to the opposite
     * of the current theme mode. If the current theme mode is `'dark'`, the theme
     * mode will be changed to `'light'`. Otherwise, the theme mode will be changed
     * to `'dark'`.
     *
     * @returns {void} No return value.
     */
    toggleThemeManually(): void {
        this.controller.source.themeMode =
            this.controller.source.themeMode === 'dark' ? 'light' : 'dark';
        const theme = this.getEditorCurrentThemeByMode(
            this.controller.source.themeMode
        );
        if (theme) {
            this.controller.source.currentTheme = theme;
        }
    }

    /**
     * Synchronizes the source code editor's theme with Obsidian's theme mode.
     *
     * This method will call `toggleThemeFollowObsidian` to set the source code
     * editor's theme mode to match Obsidian's theme mode. Then, it will call
     * `requestThemeUpdate` to trigger a re-render of the source code editor.
     *
     * @returns {Promise<void>} A promise that resolves when the theme update is complete.
     */
    async syncWithObsidian(): Promise<void> {
        this.toggleThemeFollowObsidian();
        await this.requestThemeUpdate();
    }

    /**
     * Updates the theme of the source code editor.
     *
     * If the `syncOpenAPISourceTheme` setting is enabled, the theme of the source
     * code editor will be synchronized with Obsidian's theme mode.
     *
     * Otherwise, the theme of the source code editor will be set to the value of
     * the `OpenAPISourceThemeMode` setting, and the current theme will be updated
     * accordingly. The source code editor will then be re-rendered.
     *
     * @returns {Promise<void>} A promise that resolves when the theme update is complete.
     */
    async themeUpdate(): Promise<void> {
        const controller = this.controller;
        if (controller.source.plugin.settings.syncOpenAPISourceTheme) {
            await controller.themeController.syncWithObsidian();
        } else {
            const mode =
                this.controller.source.plugin.settings.OpenAPISourceThemeMode;
            const theme =
                controller.themeController.getEditorCurrentThemeByMode(mode);
            if (theme) {
                controller.source.themeMode = mode;
                controller.source.currentTheme = theme;
                await controller.themeController.requestThemeUpdate();
            }
        }
    }
}
