import SwaggerUiCss from 'assets/swagger-ui/swagger-ui-base.css';
import SwaggerUiDarkCss from 'assets/swagger-ui/swagger-ui-dark.css';
import SwaggerUiLightCss from 'assets/swagger-ui/swagger-ui-light.css';
import { isObsidianDarkTheme } from 'ui/common/helpers';
import { Controller } from 'ui/views/OpenAPI Version/controller/controller';

export class VersionUtils {
    constructor(private readonly controller: Controller) {}

    getCombinedCSS(): string {
        let additionalCSS = '';
        if (isObsidianDarkTheme()) {
            additionalCSS = SwaggerUiDarkCss;
        } else {
            additionalCSS = SwaggerUiLightCss;
        }
        return `${SwaggerUiCss}\n${additionalCSS}`;
    }
}
