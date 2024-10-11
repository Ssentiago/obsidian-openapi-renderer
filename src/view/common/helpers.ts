import yaml from 'js-yaml';
import { setIcon } from 'obsidian';
import { OpenAPIVersionView } from '../OpenAPI Version/openapi-version-view';
import { OpenAPIView } from '../OpenAPI/openapi-view';

/**
 * Creates a new leaf of the specified type if none exists,
 * otherwise activates an existing one.
 * @param viewType The type of the view to create.
 * @param view The view that is creating a new leaf.
 * @returns A promise indicating the success of the operation.
 */
export async function createNewLeaf(
    viewType: string,
    view: OpenAPIView | OpenAPIVersionView
): Promise<void> {
    const viewLeaves = view.app.workspace.getLeavesOfType(viewType);

    const existingView = viewLeaves.find(
        (leaf) => leaf.getViewState().state.file === view.file?.path
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
                file: view.file?.path,
            },
        });
    }
}

/**
 * Converts given data from a string to a JavaScript object
 * @param data data as a string
 * @param extension the file extension of the data
 * @returns a JavaScript object
 * @throws {Error} if the file extension is not supported
 */
export function convertData(
    data: string,
    extension: string
): Record<string, any> {
    switch (extension) {
        case 'yaml':
        case 'yml':
            return yaml.load(data) as Record<string, any>;
        case 'json':
            return JSON.parse(data) as Record<string, any>;
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
