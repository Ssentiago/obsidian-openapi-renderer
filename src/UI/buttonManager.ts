import {ButtonLocation, RIBBON_LOCATION, STATUSBAR_LOCATION, TOOLBAR_LOCATION} from "../typing/types";
import {Button} from "./Button";
import {ButtonConfig} from "../typing/interfaces";
import {MarkdownView, setIcon} from "obsidian";
import UIManager from "./UIManager";

/**
 * ButtonManager class manages the creation, visibility, and removal of buttons
 * for the UIManager in Obsidian's OpenAPI Renderer Plugin.
 */
export class ButtonManager {
    buttons: Map<ButtonLocation, Map<string, Button>> = new Map();
    uiManager!: UIManager;

    constructor(uiManager: UIManager) {
        this.uiManager = uiManager;

        [RIBBON_LOCATION, STATUSBAR_LOCATION, TOOLBAR_LOCATION].forEach(location => {
            this.buttons.set(location as ButtonLocation, new Map<string, Button>());
        });
    }

    /**
     * Creates a button based on the provided configuration and adds it to the specified location.
     * Updates the button's visibility based on its initial state after creation.
     *
     * @param config - The configuration object defining the button's properties.
     */
    async createButton(config: ButtonConfig): Promise<void> {
        const buttonMap = this.buttons.get(config.location);
        if (!buttonMap) {
            return;
        }

        const htmlElement = await this.createButtonElement(config);

        if (htmlElement) {
            config.htmlElement = htmlElement;

            const buttonObject = new Button(config, this)
            buttonMap.set(config.id, buttonObject);
            this.toggleVisibility(buttonObject, config.state)
        }
    }

    /**
     * Creates an HTML element for a button based on the provided configuration.
     *
     * @param config - The configuration object defining the button's properties.
     * @returns A Promise resolving to the HTML element of the created button, or undefined if the location is invalid.
     */
    private async createButtonElement(config: ButtonConfig): Promise<HTMLElement | undefined> {
        switch (config.location) {
            case RIBBON_LOCATION:
                return this.createRibbonButtonHTMLElement(config);
            case STATUSBAR_LOCATION:
                return this.createStatusBarButtonHTMLElement(config);
            case TOOLBAR_LOCATION:
                return this.createToolBarButtonHTMLElement(config);
            default:
                return undefined;
        }
    }

    /**
     * Creates an HTML element for a ribbon button based on the provided configuration.
     *
     * @param config - The configuration object defining the button's properties.
     * @returns The HTML element of the created ribbon button.
     */
    private createRibbonButtonHTMLElement(config: ButtonConfig): HTMLElement {
        const button = this.uiManager.appContext.plugin.addRibbonIcon(config.icon, config.title, config.onClick);
        button.setAttribute('id', config.id);
        return button;
    }

    /**
     * Creates an HTML element for a status bar button based on the provided configuration.
     *
     * @param config - The configuration object defining the button's properties.
     * @returns The HTML element of the created status bar button.
     */
    private createStatusBarButtonHTMLElement(config: ButtonConfig): HTMLElement {
        const button = this.uiManager.appContext.plugin.addStatusBarItem();
        setIcon(button, config.icon);
        button.setAttribute('aria-label', config.title);
        button.setAttribute('id', config.id);
        button.addEventListener('click', config.onClick);
        return button;
    }

    /**
     * Creates an HTML element for a toolbar button based on the provided configuration.
     *
     * @param config - The configuration object defining the button's properties.
     * @returns The HTML element of the created toolbar button.
     */
    private createToolBarButtonHTMLElement(config: ButtonConfig): HTMLElement {
        const button = document.createElement("button");
        button.className = `${config.id}-button clickable-icon view-action openapi-renderer-toolbar-button`;
        setIcon(button, config.icon);
        button.setAttribute('aria-label', config.title);
        button.setAttribute('id', config.id);
        button.addEventListener('click', config.onClick);
        const view = this.uiManager.appContext.app.workspace.getActiveViewOfType(MarkdownView)
        const toolbarContainer = view && this.getToolBarContainer(view)
        if (toolbarContainer) {
            toolbarContainer.prepend(button);
        }
        return button;
    }

    /**
     * Retrieves the toolbar container element from the specified Markdown view.
     *
     * @param view - The Markdown view from which to retrieve the toolbar container.
     * @returns The toolbar container element if found, otherwise null.
     */
    getToolBarContainer(view: MarkdownView | null): Element | null {
        if (view) {
            return view.containerEl.querySelector(".view-header .view-actions");
        }
        return null
    }


    /**
     * Updates the visibility of a button based on its location and ID.
     *
     * @param location - The location of the button (e.g., `ribbon`, `statusbar`, `toolbar`).
     * @param id - The ID of the button to update.
     */
    updateButtonVisibilityByLocationAndID(location: ButtonLocation, id: string) {
        const config = this.buttons.get(location)?.get(id);
        if (config) {
            this.toggleVisibility(config, config.config.state);
        }
    }

    /**
     * Toggles the visibility of a button based on the specified state.
     *
     * @param config - The configuration object of the button.
     * @param isVisible - Indicates whether the button should be visible (`true`) or hidden (`false`).
     *                    If `true`, sets the button's display style to 'block'; otherwise, sets it to `none`.
     */
    private toggleVisibility(config: Button, isVisible: boolean) {
        const button = config.config.htmlElement
        if (button) {
            setTimeout(() => {
                button.style.setProperty('display', isVisible ? 'block' : 'none', 'important');
            }, 0);
        }
    }


    /**
     * Removes all buttons from their respective locations.
     * Clears the internal button map after removal.
     */
    async removeAllButtons() {
        this.buttons.forEach((buttonMap) => {
            buttonMap.forEach((button) => {
                button.config.htmlElement?.remove()
                button.config.htmlElement?.removeEventListener('click', button.config.onClick)
            })
        })
        this.buttons.clear()
    }

    // async updateButtonsVisibility() {
    //     for (const [location, buttonMap] of this.buttons) {
    //         for (const config of buttonMap.values()) {
    //             const isVisible = config.config.state
    //             this.toggleVisibility(config as Button, isVisible);
    //         }
    //     }
    // }
}