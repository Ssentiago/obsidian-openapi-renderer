import {ButtonID, ButtonLocation} from "../typing/types";
import {Button} from "./Button";
import {ButtonConfig} from "../typing/interfaces";
import {MarkdownView, setIcon, WorkspaceLeaf} from "obsidian";
import UIManager from "./UIManager";

/**
 * ButtonManager class manages the creation, visibility, and removal of buttons
 * for the UIManager in Obsidian's OpenAPI Renderer Plugin.
 */
export class ButtonManager {
    buttons: Map<ButtonID, Button> = new Map();
    uiManager!: UIManager;

    constructor(uiManager: UIManager) {
        this.uiManager = uiManager;
    }

    /**
     * Creates a button based on the provided configuration and adds it to the specified location.
     * Updates the button's visibility based on its initial state after creation.
     *
     * @param config - The configuration object defining the button's properties.
     */
    async createButton(config: ButtonConfig): Promise<void> {
        config.htmlElements = await this.createButtonElements(config);
        const button = new Button(config, this)
        this.buttons.set(config.id, button);
        this.toggleVisibility(button.config);
    }

    /**
     * Creates an HTML element for a button based on the provided configuration.
     *
     * @param config - The configuration object defining the button's properties.
     * @returns A Promise resolving to the HTML element of the created button, or undefined if the location is invalid.
     */
    private async createButtonElements(config: ButtonConfig): Promise<Map<ButtonLocation, HTMLElement>> {
        const buttons = new Map()
        for (const location of Object.values(ButtonLocation)) {
            switch (location) {
                case ButtonLocation.Ribbon:
                    buttons.set(location, this.createRibbonButtonHTMLElement(config));
                    break
                case ButtonLocation.Statusbar:
                    buttons.set(location, this.createStatusBarButtonHTMLElement(config))
                    break
                case ButtonLocation.Toolbar:
                    buttons.set(location, this.createToolBarButtonHTMLElement(config))
                    break
            }
        }
        return buttons
    }

    updateToolBarButton(button: Button): void {
        button.config.htmlElements?.set(ButtonLocation.Toolbar, this.createToolBarButtonHTMLElement(button.config))
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
     * Toggles the visibility of a button based on the specified state.
     *
     * @param config - The configuration object of the button.
     * @param isVisible - Indicates whether the button should be visible (`true`) or hidden (`false`).
     *                    If `true`, sets the button's display style to 'block'; otherwise, sets it to `none`.
     */

    toggleVisibility(config: ButtonConfig) {
        config.htmlElements &&
        config.htmlElements.forEach((v, k) => {
            config.state(k) ? v.show() : v.hide();
        })
    }


    /**
     * Removes all buttons from their respective locations.
     * Clears the internal button map after removal.
     */
    async removeAllButtons() {
        debugger
        this.buttons.forEach((button) => {
            button.config.htmlElements?.forEach((v, k) => {
                v?.remove()
                v?.removeEventListener('click', button.config.onClick)
            })
        })
        this.buttons.clear()
    }


    async updateToolbar(leaf: WorkspaceLeaf) {
        const view = leaf.view as MarkdownView;

        if (!view) return;


        for (const leaf of this.uiManager.appContext.app.workspace.getLeavesOfType("markdown")) {
            this.removeToolbarButtonsFromView(leaf.view as MarkdownView);
        }

        for (const button of this.buttons.values()) {
            this.updateToolBarButton(button)
        }
    }


    removeToolbarButtonsFromView(view: MarkdownView) {
        if (!view) return;

        const toolbarContainer = this.getToolBarContainer(view);
        if (!toolbarContainer) return;

        const toolbarButtons = toolbarContainer.querySelectorAll('.openapi-renderer-toolbar-button')
                toolbarButtons.forEach(button => toolbarContainer.removeChild(button))
    }
}