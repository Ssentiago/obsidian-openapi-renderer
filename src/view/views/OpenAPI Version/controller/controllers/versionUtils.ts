import { isObsidianDarkTheme } from 'view/common/helpers';
import { RESOURCE_NAME } from 'view/typing/constants';
import { Controller } from 'view/views/OpenAPI Version/controller/controller';

export class VersionUtils {
    constructor(private readonly controller: Controller) {}

    async getCombinedCSS(): Promise<string> {
        const { plugin } = this.controller.versionView;
        const baseCSS = await plugin.resourceManager.getCSS(
            RESOURCE_NAME.BaseCSS
        );

        const isDarkMode = isObsidianDarkTheme();
        const additionalCSSName = isDarkMode
            ? RESOURCE_NAME.DarkThemeCSS
            : RESOURCE_NAME.LightThemeCSS;
        const additionalCSS =
            await plugin.resourceManager.getCSS(additionalCSSName);

        return `${baseCSS}\n${additionalCSS}`;
    }
}
