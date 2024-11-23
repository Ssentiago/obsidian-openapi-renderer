import yaml from 'js-yaml';
import { setIcon } from 'obsidian';
import { EntryView } from 'ui/views/OpenAPI Entry/entry-view';
import { VersionView } from 'ui/views/OpenAPI Version/version-view';
import { OpenAPIView } from '../views/OpenAPI/openapi-view';

export async function createNewLeaf(
    viewType: string,
    view: OpenAPIView | VersionView | EntryView,
    filePath?: string
): Promise<void> {
    const viewLeaves = view.app.workspace.getLeavesOfType(viewType);

    let path: string;
    if (view instanceof EntryView) {
        path = filePath!;
    } else {
        path = view.file?.path!;
    }

    if (!path) {
        return;
    }

    const existingView = viewLeaves.find(
        (leaf) => leaf.getViewState().state?.file === path
    );
    if (existingView) {
        const newViewState = {
            ...existingView.getViewState(),
            active: true,
        };
        await existingView.setViewState(newViewState);
    } else {
        const newLeaf = view.app.workspace.getLeaf(true);
        await newLeaf.setViewState({
            type: viewType,
            active: true,
            state: {
                file: path,
            },
        });
    }
}

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
    const body = document.querySelector('body');
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
