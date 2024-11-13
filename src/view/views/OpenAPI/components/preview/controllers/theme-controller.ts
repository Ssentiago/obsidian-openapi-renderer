import { isObsidianDarkTheme } from 'view/common/helpers';
import OpenAPIPreviewController from 'view/views/OpenAPI/components/preview/controllers/preview-controller';

import { RESOURCE_NAME } from 'view/typing/constants';

export class ThemeController {
    constructor(public controller: OpenAPIPreviewController) {}

    /**
     * Initializes the theme controller.
     *
     * This method is called when the preview is initializes.
     *
     * If the `syncOpenAPIPreviewTheme` setting is enabled, the theme controller
     * will synchronize the theme with Obsidian's theme mode.
     *
     * Otherwise, the theme controller will use the `OpenAPIPreviewTheme` setting
     * to set the initial theme mode.
     *
     * @returns {void}
     */
    initializeTheme(): void {
        if (this.controller.preview.plugin.settings.syncOpenAPIPreviewTheme) {
            this.toggleThemeFollowObsidian();
        } else {
            const { settings } = this.controller.preview.plugin;
            this.controller.preview.themeMode = settings.OpenAPIPreviewTheme;
            this.controller.preview.currentThemeCSS =
                this.getPreviewCurrentThemeByMode(settings.OpenAPIPreviewTheme);
        }
    }

    /**
     * Requests a theme update.
     *
     * This method will trigger a re-render of the preview.
     *
     * @returns {Promise<void>} A promise that resolves when the theme update is complete.
     */
    async requestThemeUpdate(): Promise<void> {
        await this.controller.renderController.rerender();
    }

    /**
     * Toggles the theme of the preview to follow Obsidian's theme mode.
     *
     * This method checks the current theme mode of Obsidian and sets the
     * theme mode of the preview to match. If the current theme mode is
     * dark, the preview will use the dark theme. Otherwise, the preview
     * will use the light theme.
     *
     * @returns {void}
     */
    toggleThemeFollowObsidian(): void {
        const currentMode = isObsidianDarkTheme() ? 'dark' : 'light';
        this.controller.preview.themeMode = currentMode;
        const theme = this.getPreviewCurrentThemeByMode(currentMode);
        this.controller.preview.themeMode = currentMode;
        this.controller.preview.currentThemeCSS = theme;
    }

    /**
     * Returns the icon to use for the theme button.
     *
     * The theme button is used to toggle the theme of the preview.
     *
     * If the current theme mode is dark, the icon is 'moon'. Otherwise, the icon is 'sun'.
     *
     * @returns {'moon' | 'sun'} The theme button icon.
     */
    get themeButtonIcon(): 'moon' | 'sun' {
        return this.controller.preview.themeMode === 'dark' ? 'moon' : 'sun';
    }

    /**
     * Toggles the theme of the preview manually.
     *
     * This method changes the theme mode of the preview to the opposite
     * of the current theme mode. If the current theme mode is dark, the
     * theme mode is changed to light. Otherwise, the theme mode is changed
     * to dark.
     *
     * @returns {void}
     */
    toggleThemeManually(): void {
        this.controller.preview.themeMode =
            this.controller.preview.themeMode === 'dark' ? 'light' : 'dark';
        this.controller.preview.currentThemeCSS =
            this.getPreviewCurrentThemeByMode(
                this.controller.preview.themeMode
            );
    }

    /**
     * Synchronizes the preview theme with Obsidian's theme mode.
     *
     * The method first calls `toggleThemeFollowObsidian` to set the preview's
     * theme mode to match Obsidian's theme mode. Then, it calls
     * `requestThemeUpdate` to trigger a re-render of the preview.
     *
     * @returns {Promise<void>} A promise that resolves when the theme update is complete.
     */
    async syncWithObsidian(): Promise<void> {
        this.toggleThemeFollowObsidian();
        await this.requestThemeUpdate();
    }

    /**
     * Returns the current theme for the preview given the specified mode.
     *
     * @param {string} mode - The theme mode to return the current theme for.
     * @returns {RESOURCE_NAME} The current theme for the preview.
     */
    getPreviewCurrentThemeByMode(mode: string): RESOURCE_NAME {
        switch (mode) {
            case 'dark':
                return RESOURCE_NAME.DarkThemeCSS;
            case 'light':
                return RESOURCE_NAME.LightThemeCSS;
            default:
                throw new Error(`Unsupported mode: ${mode}`);
        }
    }

    /**
     * Updates the theme of the preview.
     *
     * If the `syncOpenAPIPreviewTheme` setting is enabled, the preview's theme
     * mode will be synchronized with Obsidian's theme mode.
     *
     * Otherwise, the preview's theme mode will be set to the value of the
     * `OpenAPIPreviewTheme` setting, and the current theme will be updated
     * accordingly. The preview will then be re-rendered.
     *
     * @returns {Promise<void>} A promise that resolves when the theme update is complete.
     */
    async themeUpdate(): Promise<void> {
        const { plugin } = this.controller.preview;
        if (plugin.settings.syncOpenAPIPreviewTheme) {
            await this.controller.themeController.syncWithObsidian();
        } else {
            const mode = plugin.settings.OpenAPIPreviewTheme;
            this.controller.preview.themeMode = mode;
            this.controller.preview.currentThemeCSS =
                this.controller.themeController.getPreviewCurrentThemeByMode(
                    mode
                );
            await this.controller.renderController.rerender();
        }
    }
}
