import {ButtonID} from "../typing/types";
import {Button} from "./Button";
import {ButtonConfig} from "../typing/interfaces";
import {MarkdownView, setIcon, WorkspaceLeaf} from "obsidian";
import UIManager from "./UIManager";
import {ButtonFactory} from "./buttonFactory";
import {ButtonLocation} from "../typing/constants";

/**
 * Manages the lifecycle and behavior of buttons within the Obsidian OpenAPIRenderer Plugin.
 * This includes creating, updating, toggling visibility, and removing buttons.
 */
export class ButtonManager {
    buttons: Map<ButtonID, Button> = new Map();
    uiManager!: UIManager;
    buttonFactory = new ButtonFactory(this);
    private periodicCheckInterval: NodeJS.Timeout | null = null;

    constructor(uiManager: UIManager) {
        this.uiManager = uiManager;
    }

    async initializeButtons(): Promise<void> {
        await this.createAllButtons();
        // this.__test__checkButtonStates();
        // this.__test__startPeriodicCheck();
        // this.__test__listenForObsidianChanges();
    }

    // private __test__setButtonVisibility(button: HTMLElement, shouldBeVisible: boolean): void {
    //     requestAnimationFrame(() => {
    //         if (shouldBeVisible) {
    //             button.show();
    //         } else {
    //             button.hide();
    //         }
    //         setTimeout(() => {
    //             const isVisible = button.hidden
    //             if (isVisible !== shouldBeVisible) {
    //                 this.uiManager.appContext.plugin.logger.warn('Button should be visible: ', shouldBeVisible);
    //                 this.uiManager.appContext.plugin.logger.warn('Button is:', isVisible)
    //                 this.uiManager.appContext.plugin.logger.warn(`Button visibility mismatch detected.`);
    //                 shouldBeVisible ? button.show() : button.hide();
    //             }
    //         }, 50);
    //     });
    // }
    //
    // __test__checkButtonStates(): void {
    //     requestAnimationFrame(() => {
    //         this.buttons.forEach((button, id) => {
    //             button.config.htmlElements?.forEach((element, location) => {
    //                 const shouldBeVisible = button.config.state(location);
    //                 const isVisible = element.isShown()
    //                 this.uiManager.appContext.plugin.logger.debug(`Button ${id} at ${location}: should be ${shouldBeVisible ? 'visible' : 'hidden'}, is ${isVisible ? 'visible' : 'hidden'}`);
    //                 if (shouldBeVisible !== isVisible) {
    //                     this.uiManager.appContext.plugin.logger.warn(`Mismatch in button ${id} visibility`);
    //                 }
    //             });
    //         });
    //     });
    // }

    // private __test__startPeriodicCheck(): void {
    //     if (this.periodicCheckInterval) {
    //         clearInterval(this.periodicCheckInterval);
    //     }
    //     this.periodicCheckInterval = setInterval(() => {
    //         this.__test__checkButtonStates();
    //     }, 20000);
    // }
    //
    // private __test__listenForObsidianChanges(): void {
    //     this.uiManager.appContext.app.workspace.on('layout-change', this.__test__onObsidianChange.bind(this));
    //     this.uiManager.appContext.app.workspace.on('active-leaf-change', this.__test__onObsidianChange.bind(this));
    //     this.uiManager.appContext.app.workspace.on('file-open', this.__test__onObsidianChange.bind(this));
    // }
    //
    // private __test__onObsidianChange(): void {
    //     // Используем debounce, чтобы не вызывать проверку слишком часто
    //     this.debouncedCheckButtonStates();
    // }
    //
    // private debouncedCheckButtonStates = this.__test__debounce(() => {
    //     this.__test__checkButtonStates();
    // }, 100);
    //
    // private __test__debounce(func: Function, wait: number): Function {
    //     let timeout: NodeJS.Timeout | null = null;
    //     return (...args: any[]) => {
    //         if (timeout) {clearTimeout(timeout);}
    //         timeout = setTimeout(() => func(...args), wait);
    //     };
    // }


    /**
     * Asynchronously creates a button based on the provided configuration.
     *
     * @param config The configuration object for the button.
     * @returns A promise that resolves when the button is created.
     */
    private async createButton(config: ButtonConfig): Promise<void> {
        config.htmlElements = await this.createButtonElements(config);
        const button = new Button(config, this)
        this.buttons.set(config.id, button);
    }

    /**
     * Asynchronously creates HTML elements for the button based on its configuration.
     *
     * @param config The configuration object for the button.
     * @returns A promise that resolves to a map of button locations to their corresponding HTML elements.
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


    /**
     * Creates an HTML element for a ribbon button based on the provided configuration.
     *
     * @param config - The configuration object defining the button's properties.
     * @returns The HTML element of the created ribbon button.
     */
    private createRibbonButtonHTMLElement(config: ButtonConfig): HTMLElement {
        const button = this.uiManager.appContext.plugin.addRibbonIcon(config.icon, config.title, config.onClick);
        button.setAttribute('id', config.id);
        config.state(ButtonLocation.Ribbon) ? button.show() : button.hide();
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
        config.state(ButtonLocation.Statusbar) ? button.show() : button.hide();
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
        const toolbarContainer = this.getToolBarContainer(view)
        if (toolbarContainer) {
            toolbarContainer.prepend(button);
        }
        config.state(ButtonLocation.Toolbar) ? button.show() : button.hide();
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
     * Toggles the visibility of the button based on its configuration.
     *
     * @param config The configuration object for the button.
     */
    // todo the function is buggy, observe the behavior
    async toggleVisibility(config: ButtonConfig): Promise<void> {
        if (!config.htmlElements) {return}
        for (const [location, element] of config.htmlElements) {
            const shouldItBeVisible = config.state(location)
            if (shouldItBeVisible) {
                element.show();
            } else {
                element.hide();
            }
        }
    }


    /**
     * This method asynchronously creates all buttons based on configurations generated by the button factory.
     */
    async createAllButtons(): Promise<void> {
        const configs = this.buttonFactory.createAllButtonConfigs();
        await Promise.all(configs.map(config => this.createButton(config)))
        // this.__test__checkButtonStates()
    }


    /**
     * Removes all buttons managed by the button manager.
     * This method iterates through all buttons, removes their HTML elements from the DOM,
     * and removes event listeners attached to them.
     */
    async removeAllButtons(): Promise<void> {
        this.buttons.forEach((button) => {
            button.config.htmlElements?.forEach((element) => {
                element.remove()
                element.removeEventListener('click', button.config.onClick)
            })
        })
        this.buttons.clear()
    }

    /**
     * Updates the toolbar buttons for a specific MarkdownView leaf.
     * Removes existing toolbar buttons from all MarkdownView leaves and adds new buttons
     * based on the current configuration of managed buttons.
     * @param leaf The WorkspaceLeaf containing the MarkdownView to update toolbar buttons for.
     */
    async updateToolbar(leaf: WorkspaceLeaf): Promise<void> {
        for (const leaf of this.uiManager.appContext.app.workspace.getLeavesOfType("markdown")) {
            this.removeToolbarButtonsFromView(leaf.view as MarkdownView);
        }
        for (const button of this.buttons.values()) {
            button.config.htmlElements?.set(ButtonLocation.Toolbar, this.createToolBarButtonHTMLElement(button.config))
        }
    }

    /**
     * Removes all toolbar buttons from the specified MarkdownView.
     * @param view The MarkdownView from which to remove toolbar buttons.
     */
    private removeToolbarButtonsFromView(view: MarkdownView): void {
        const toolbarContainer = this.getToolBarContainer(view);
        if (!toolbarContainer) {
            return;
        }

        const toolbarButtons = toolbarContainer.querySelectorAll('.openapi-renderer-toolbar-button')
        toolbarButtons.forEach(button => toolbarContainer.removeChild(button))
    }
}