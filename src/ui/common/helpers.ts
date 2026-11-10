import yaml from 'js-yaml';
import { setIcon } from 'obsidian';

/**
 * Converts given data from a JSON / YAML string to JSON string
 * @param data data as a string
 * @param extension the file extension of the data
 * @returns a JSON string
 * @throws {Error} if the file extension is not supported
 */
export function convertData(data: string, extension: string): string {
    switch (extension) {
        case 'yaml':
        case 'yml':
            return JSON.stringify(yaml.load(data));
        case 'json':
            return data;
        default:
            throw new Error(`Unsupported file extension: ${extension}`);
    }
}

/**
 * Checks if the current Obsidian theme is dark
 * @returns true if the Obsidian theme is dark, false otherwise
 */
export function isObsidianDarkTheme(): boolean {
    const body = activeDocument.querySelector('body');
    return !!body?.classList.contains('theme-dark');
}

/**
 * Updates an HTML button element with a given icon and/or title
 * @param button the HTML button element to update
 * @param icon the icon to set on the button (optional)
 * @param title the title to set on the button (optional)
 * @returns void
 */
export function updateButton(
    button: HTMLElement,
    icon?: string,
    title?: string
): void {
    if (icon) {
        setIcon(button, icon);
    }
    if (title) {
        button.ariaLabel = title;
    }
}
