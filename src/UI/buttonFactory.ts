import { ButtonConfig } from '../typing/interfaces';
import { MarkdownView } from 'obsidian';
import { ButtonManager } from './buttonManager';
import {
    ButtonLocation,
    RenderingMode,
    SERVER_ICON_NAME_OFF,
    SERVER_ICON_NAME_ON,
} from '../typing/constants';

/**
 * The ButtonFactory class manages the creation of button configurations for OpenAPI Renderer plugin buttons.
 */
export class ButtonFactory {
    buttonManager: ButtonManager;

    constructor(buttonManager: ButtonManager) {
        this.buttonManager = buttonManager;
    }

    /**
     * Generates an array of button configurations representing all buttons managed by the button factory.
     * @returns An array of ButtonConfig objects representing various button configurations.
     */
    createAllButtonConfigs(): ButtonConfig[] {
        return [
            this.createServerButtonConfig(),
            this.createRenderButtonConfig(),
            this.createRefreshButtonConfig(),
        ];
    }

    /**
     * Creates a configuration object for the server toggle button.
     * @returns The ButtonConfig object representing the server toggle button configuration.
     */
    private createServerButtonConfig(): ButtonConfig {
        const { plugin } = this.buttonManager.uiManager.appContext;
        return {
            id: `openapi-renderer-server`,
            get icon(): string {
                return plugin.server.isRunning()
                    ? SERVER_ICON_NAME_ON
                    : SERVER_ICON_NAME_OFF;
            },
            title: 'Toggle OpenAPI Renderer Server',
            onClick: (event: MouseEvent) =>
                plugin.eventsHandler.handleServerButtonClick(event),

            get locations(): Set<ButtonLocation> {
                return plugin.settings.serverButtonLocations;
            },
            htmlElements: undefined,
            state(location: ButtonLocation): boolean {
                const isMarkdownView =
                    !!plugin.app.workspace.getActiveViewOfType(MarkdownView);
                const isCreationAllowedNow =
                    plugin.settings.isCreateServerButton;
                const isCorrectLocation = this.locations.has(location);
                const isVisibleInCurrentView =
                    ['ribbon', 'statusbar'].includes(location) ||
                    isMarkdownView;
                return (
                    isCreationAllowedNow &&
                    isCorrectLocation &&
                    isVisibleInCurrentView
                );
            },
            buttonType: 'server-button',
        };
    }

    /**
     * Creates a configuration object for the render button.
     * @returns The ButtonConfig object representing the render button configuration.
     */
    private createRenderButtonConfig(): ButtonConfig {
        const { plugin } = this.buttonManager.uiManager.appContext;
        return {
            id: `openapi-renderer`,
            icon: 'file-scan',
            title: 'Render Swagger UI',
            onClick: async (): Promise<void> => {
                const view =
                    plugin.app.workspace.getActiveViewOfType(MarkdownView);
                view &&
                    (await plugin.openAPI.renderOpenAPIResources(
                        view,
                        RenderingMode.Inline
                    ));
            },
            get locations(): Set<ButtonLocation> {
                return plugin.settings.renderButtonLocation;
            },
            htmlElements: undefined,
            state(location: ButtonLocation): boolean {
                const isMarkdownView =
                    !!plugin.app.workspace.getActiveViewOfType(MarkdownView);
                const isCreationAllowedNow =
                    plugin.settings.isCreateCommandButtons;
                const isCorrectLocation = this.locations.has(location);
                const isVisibleInCurrentView =
                    ['ribbon', 'statusbar'].includes(location) ||
                    isMarkdownView;
                return (
                    isCreationAllowedNow &&
                    isCorrectLocation &&
                    isVisibleInCurrentView
                );
            },
            buttonType: 'command-button',
        };
    }

    /**
     * Creates a configuration object for the refresh button.
     * @returns The ButtonConfig object representing the refresh button configuration.
     */
    private createRefreshButtonConfig(): ButtonConfig {
        const { plugin } = this.buttonManager.uiManager.appContext;
        return {
            id: `openapi-refresher`,
            icon: 'refresh-ccw',
            title: 'Refresh Swagger UI',
            onClick: async (): Promise<void> => {
                const view =
                    plugin.app.workspace.getActiveViewOfType(MarkdownView);
                view && plugin.previewHandler.rerenderPreview(view);
            },
            get locations(): Set<ButtonLocation> {
                return plugin.settings.refreshButtonLocation;
            },
            htmlElements: undefined,
            state(location: ButtonLocation): boolean {
                const isMarkdownView =
                    !!plugin.app.workspace.getActiveViewOfType(MarkdownView);
                const isCreationAllowedNow =
                    plugin.settings.isCreateCommandButtons;
                const isCorrectLocation = this.locations.has(location);
                const isVisibleInCurrentView =
                    ['ribbon', 'statusbar'].includes(location) ||
                    isMarkdownView;

                return (
                    isCreationAllowedNow &&
                    isCorrectLocation &&
                    isVisibleInCurrentView
                );
            },
            buttonType: 'command-button',
        };
    }
}
