import { VersionController } from './version-controller';

export class ThemeController {
    constructor(private controller: VersionController) {}

    isObsidianDarkTheme(): boolean {
        const body = document.querySelector('body');
        return !!body?.classList.contains('theme-dark');
    }
}
