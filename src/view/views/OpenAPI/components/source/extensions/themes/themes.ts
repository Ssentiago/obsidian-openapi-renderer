import { darkThemes } from 'view/views/OpenAPI/components/source/extensions/themes/dark';
import { lightThemes } from 'view/views/OpenAPI/components/source/extensions/themes/light';

export const themes = new Map([
    ...Array.from(darkThemes.entries()),
    ...Array.from(lightThemes.entries()),
]);
