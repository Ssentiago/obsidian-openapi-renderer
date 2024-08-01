import { darkTheme, lightTheme } from '../themes';
import { Compartment } from '@codemirror/state';
import { EditorController } from './editor-controller';

export class ThemeManager {
    themeConfigurator: Compartment = new Compartment();

    constructor(private controller: EditorController) {}

    initializeTheme(): void {
        if (
            this.controller.editor.plugin.settings.synchronizeSwaggerEditorTheme
        ) {
            this.toggleThemeFollowObsidian();
        } else {
            this.controller.editor.currentThemeMode =
                this.controller.editor.plugin.settings.swaggerEditorTheme;
            this.controller.editor.currentTheme =
                this.controller.editor.currentThemeMode === 'dark'
                    ? darkTheme
                    : lightTheme;
        }
    }

    isObsidianDarkTheme(): boolean {
        const body = document.querySelector('body');
        return !!body?.classList.contains('theme-dark');
    }

    requestThemeChange(): void {
        this.controller.editor.editor.dispatch({
            effects: this.themeConfigurator.reconfigure(
                this.controller.editor.currentTheme
            ),
        });
    }

    getThemeButtonIcon(): 'moon' | 'sun' {
        return this.controller.editor.currentThemeMode === 'dark'
            ? 'moon'
            : 'sun';
    }

    toggleThemeFollowObsidian(): void {
        this.controller.editor.currentThemeMode = this.isObsidianDarkTheme()
            ? 'dark'
            : 'light';
        this.controller.editor.currentTheme =
            this.controller.editor.currentThemeMode === 'dark'
                ? darkTheme
                : lightTheme;
    }

    toggleThemeManually(): void {
        const oldThemeMode = this.controller.editor.currentThemeMode;
        this.controller.editor.currentThemeMode =
            this.controller.editor.currentThemeMode === 'dark'
                ? 'light'
                : 'dark';
        this.controller.editor.currentTheme =
            oldThemeMode === 'dark' ? lightTheme : darkTheme;
    }

    syncWithObsidian(): void {
        this.toggleThemeFollowObsidian();
        this.requestThemeChange();
    }
}
