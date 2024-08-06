import { darkThemes } from './dark';
import { lightThemes } from './light';

export const themes = new Map([
    ...Array.from(darkThemes.entries()),
    ...Array.from(lightThemes.entries()),
]);
