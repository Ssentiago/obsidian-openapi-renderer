import {ButtonConfig} from "../typing/interfaces";
import {ButtonLocation, RenderingMode, SERVER_ICON_NAME_OFF, SERVER_ICON_NAME_ON} from "../typing/types";
import {MarkdownView} from "obsidian";
import UIManager from "./UIManager";

/**
 * ButtonFactory class handles the creation of button configurations
 * for different locations (ribbon, statusbar, toolbar) in UIManager.
 */
export class ButtonFactory {
    uiManager: UIManager;

    constructor(uiManager: UIManager) {
        this.uiManager = uiManager;
    }

    /**
     * Creates an array of all button configurations for different locations.
     *
     * @returns An array of ButtonConfig objects representing all button configurations.
     */
    createAllButtonConfigs(): ButtonConfig[] {
        const allConfigs: ButtonConfig[] = [];
        const locations: ButtonLocation[] = ['ribbon', 'statusbar', 'toolbar'];

        for (const location of locations) {
            allConfigs.push(this.createServerButtonConfig(location, this));
            allConfigs.push(this.createRenderButtonConfig(location, this));
            allConfigs.push(this.createRefreshButtonConfig(location, this));
        }
        return allConfigs;
    }

    /**
     * Creates a configuration object for the server toggle button.
     *
     * @param location - The location where the button will be placed (e.g., 'ribbon', 'statusbar', 'toolbar').
     * @param buttonFactory - The ButtonFactory instance managing button creation.
     * @returns A ButtonConfig object representing the server toggle button configuration.
     */
    private createServerButtonConfig(location: ButtonLocation, buttonFactory: ButtonFactory): ButtonConfig {
        return {
            id: `openapi-renderer-server`,
            get icon() {
                return buttonFactory.uiManager.appContext.plugin.server.isRunning() ? SERVER_ICON_NAME_ON : SERVER_ICON_NAME_OFF;
            },
            title: 'Toggle OpenAPI Renderer Server',
            onClick: (event: MouseEvent) => this.uiManager.toggleServer(event),
            location: location,
            htmlElement: undefined,
            get state() {
                const isMarkdownView = buttonFactory.uiManager.appContext.app.workspace.getLeaf()?.view instanceof MarkdownView;
                const isCreationAllowedNow = buttonFactory.uiManager.settings.isCreateServerButton
                const isCorrectLocation = buttonFactory.uiManager.settings.serverButtonLocation === location;
                const isVisibleInCurrentView = location === 'ribbon' || isMarkdownView
                return isCreationAllowedNow && isCorrectLocation && isVisibleInCurrentView;
            },
            buttonType: 'server-button'
        };
    }

    /**
     * Creates a configuration object for the render Swagger UI button.
     *
     * @param location - The location where the button will be placed (e.g., 'ribbon', 'statusbar', 'toolbar').
     * @param buttonFactory - The ButtonFactory instance managing button creation.
     * @returns A ButtonConfig object representing the render Swagger UI button configuration.
     */
    private createRenderButtonConfig(location: ButtonLocation, buttonFactory: ButtonFactory): ButtonConfig {
        return {
            id: `openapi-renderer`,
            icon: 'file-scan',
            title: 'Render Swagger UI',
            onClick: async () => {
                const view = buttonFactory.uiManager.appContext.app.workspace.getActiveViewOfType(MarkdownView);
                await this.uiManager.appContext.plugin.renderOpenAPI(view!, RenderingMode.Inline);
            },
            location: location,
            htmlElement: undefined,
            get state() {
                const isMarkdownView = buttonFactory.uiManager.appContext.app.workspace.getLeaf()?.view instanceof MarkdownView;
                const isCreationAllowedNow = buttonFactory.uiManager.settings.isCreateCommandButtons
                const isCorrectLocation = buttonFactory.uiManager.settings.commandButtonLocation === location;
                const isVisibleInCurrentView = location === 'ribbon' || isMarkdownView
                return isCreationAllowedNow && isCorrectLocation && isVisibleInCurrentView;
            },
            buttonType: 'command-button'
        };
    }

    /**
     * Creates a configuration object for the refresh Swagger UI button.
     *
     * @param location - The location where the button will be placed (e.g., 'ribbon', 'statusbar', 'toolbar').
     * @param buttonFactory - The ButtonFactory instance managing button creation.
     * @returns A ButtonConfig object representing the refresh Swagger UI button configuration.
     */
    private createRefreshButtonConfig(location: ButtonLocation, buttonFactory: ButtonFactory): ButtonConfig {
        return {
            id: `openapi-refresher`,
            icon: 'refresh-ccw',
            title: 'Refresh Swagger UI',
            onClick: async () => {
                const view = buttonFactory.uiManager.appContext.app.workspace.getActiveViewOfType(MarkdownView);
                await this.uiManager.appContext.plugin.refreshOpenAPI(view!);
            },
            location: location,
            htmlElement: undefined,
            get state() {
                const isMarkdownView = buttonFactory.uiManager.appContext.app.workspace.getLeaf()?.view instanceof MarkdownView;

                const isCreationAllowedNow = buttonFactory.uiManager.settings.isCreateCommandButtons
                const isCorrectLocation = buttonFactory.uiManager.settings.commandButtonLocation === location;
                const isVisibleInCurrentView = location === 'ribbon' || isMarkdownView
                return isCreationAllowedNow && isCorrectLocation && isVisibleInCurrentView;
            },
            buttonType: 'command-button'
        };
    }
}