import { EventID } from 'events-management/typing/constants';
import {
    OpenAPIThemeChangeState,
    UpdateOpenAPIViewStateEvent,
} from 'events-management/typing/interfaces';
import { AnchorData } from 'indexedDB/database/anchor';
import { MessageType, ResponseType } from 'indexedDB/typing/interfaces';
import { createNewLeaf, updateButton } from 'ui/common/helpers';
import { RenderingMode } from 'ui/typing/constants';

import { OPENAPI_VERSION_VIEW } from 'ui/typing/types';
import { AnchorModal } from 'ui/views/OpenAPI/components/source/modals/anchors-modal/anchor-modal';
import { UtilController } from 'ui/views/OpenAPI/controllers/util-controller';
import { OpenAPIView } from 'ui/views/OpenAPI/openapi-view';

export class OpenAPIController {
    utils: UtilController;
    constructor(public view: OpenAPIView) {
        this.utils = new UtilController(this);
        this.initializeActions();
        this.setupEventListeners();
    }

    /**
     * The new mode that the view should be switched to.
     * Given the current mode, it will return the other supported mode.
     * Switches between Preview and Source modes
     * If the current mode is not supported, it will throw an error.
     *
     * @returns {RenderingMode} The new mode to switch to.
     */
    get newMode(): RenderingMode {
        switch (this.view.mode) {
            case RenderingMode.Preview:
                return RenderingMode.Source;
            case RenderingMode.Source:
                return RenderingMode.Preview;
            default:
                throw new Error(`Unsupported mode: ${this.view.mode}`);
        }
    }

    /**
     * Returns the icon to use for the mode switch action.
     *
     * When the mode is Preview, the icon is 'book-open'. Otherwise, the icon is 'pen'.
     *
     * @returns {'book-open' | 'pen'} The icon to use.
     */
    get modeActionIcon(): 'book-open' | 'pen' {
        return this.view.mode === RenderingMode.Preview ? 'book-open' : 'pen';
    }

    /**
     * The title to use for the mode switch action.
     *
     * Given the current mode, it will return a string that describes the current view
     * and the action that will occur when the button is clicked.
     *
     * The string is formatted as follows:
     *   Current view: [reading|editing]
     *   Click to [edit|read]
     *   Ctrl+Click to open to the right
     *   Alt+Click to open in floating window
     *
     * @returns {string} The title to use.
     */
    get modeActionTitle(): string {
        const currentMode = this.view.mode;
        const currentViewMsg = `Current view: ${currentMode === RenderingMode.Preview ? 'reading' : 'editing'}`;
        const modeMsg = `Click to ${currentMode === RenderingMode.Preview ? 'edit' : 'read'}`;
        const ctrlAltMsg = `Ctrl+Click to open to the right\nAlt+Click to open in floating window`;
        return `${currentViewMsg}\n${modeMsg}\n${ctrlAltMsg}`;
    }

    /**
     * Initializes the actions for the OpenAPI view.
     *
     * The actions are:
     *   1. Mode switch button: Switches between Preview and Source modes.
     *      It will open a new leaf of the same type to the right if Ctrl is pressed,
     *      and open a new leaf of the same type in a floating window if Alt is pressed.
     *      Otherwise, it will switch the mode of the current leaf.
     *   2. Version control button: Opens a new leaf of type OPENAPI_VERSION_VIEW_TYPE.
     *   3. Theme button: Switches current active component between light and dark theme.
     *
     * @returns {Object} An object with the following keys:
     *  - changeModeButton: The mode switch button.
     *  - versionViewButton: The version control button.
     *  - themeButton: The theme button.
     */
    initializeActions(): {
        versionViewButton: HTMLElement;
        changeModeButton: HTMLElement;
        themeButton: HTMLElement;
    } {
        const changeModeButton = this.view.addAction(
            this.modeActionIcon,
            this.modeActionTitle,
            async (event: MouseEvent) => {
                const oldState = this.view.leaf.getViewState();
                if (event.ctrlKey) {
                    await this.utils.openLeaf('split', oldState);
                } else if (event.altKey) {
                    await this.utils.openLeaf('window', oldState);
                } else {
                    this.view.onSwitch();
                }
                updateButton(
                    changeModeButton,
                    this.modeActionIcon,
                    this.modeActionTitle
                );
            }
        );

        const versionViewButton = this.view.addAction(
            'git-compare-arrows',
            'Version control',
            async () => {
                await createNewLeaf(OPENAPI_VERSION_VIEW, this.view);
            }
        );

        const themeButton = this.view.addAction(
            this.view.activeComponent?.controller.themeController
                .themeButtonIcon ?? '',
            `Theme: ${this.view.activeComponent?.themeMode}`,
            async () => {
                if (!this.view.activeComponent) {
                    return;
                }
                this.view.activeComponent.controller.themeController.toggleThemeManually();
                await this.view.activeComponent.controller.themeController.requestThemeUpdate();
                updateButton(
                    themeButton,
                    this.view.activeComponent.controller.themeController
                        .themeButtonIcon,
                    `Theme: ${this.view.activeComponent.themeMode}`
                );
            }
        );

        this.view.plugin.observer.subscribe(
            this.view.plugin.app.workspace,
            EventID.SwitchModeState,
            async () => {
                updateButton(
                    changeModeButton,
                    this.modeActionIcon,
                    this.modeActionTitle
                );
            }
        );

        this.view.plugin.observer.subscribe(
            this.view.plugin.app.workspace,
            EventID.SwitchModeState,
            async () => {
                updateButton(
                    themeButton,
                    this.view.activeComponent?.controller.themeController
                        .themeButtonIcon,
                    `Theme: ${this.view.activeComponent?.themeMode}`
                );
            }
        );

        this.view.plugin.observer.subscribe(
            this.view.plugin.app.workspace,
            EventID.OpenAPIThemeChangeState,
            async (event: OpenAPIThemeChangeState) => {
                const mode = event.data.mode as RenderingMode;
                if (mode !== this.view.mode) {
                    return;
                }
                updateButton(
                    themeButton,
                    this.view.activeComponent?.controller.themeController
                        .themeButtonIcon,
                    `Theme: ${this.view.activeComponent?.themeMode}`
                );
            }
        );

        return {
            changeModeButton: changeModeButton,
            versionViewButton: versionViewButton,
            themeButton: themeButton,
        };
    }

    /**
     * Sets up event listeners.
     *
     * This method sets up event listeners for:
     *   1. Ctrl+E keyboard shortcut: Switches between Preview and Source modes.
     *   2. `UpdateOpenAPIViewState` event: Updates the content of the view if the
     *      file is the one currently being rendered and the mode is the same.
     *   3. `css-change` event: Updates the theme of the view when the app theme changes.
     *   4. `OpenAPIThemeChangeState` event: Updates the theme of the view when the theme
     *      of another view changes and the mode is the same.
     *
     * @returns {void} No return value.
     */
    setupEventListeners(): void {
        this.view.plugin.registerDomEvent(
            this.view.containerEl,
            'keyup',
            (event: KeyboardEvent) => {
                if (event.ctrlKey && event.code === 'KeyE') {
                    this.view.onSwitch();
                }
            }
        );
        this.view.plugin.observer.subscribe(
            this.view.app.workspace,
            EventID.UpdateOpenAPIViewState,
            async (event: UpdateOpenAPIViewStateEvent) => {
                const file = event.data.file;
                if (this.view.file?.path === file) {
                    const content = await this.view.app.vault.cachedRead(
                        this.view.file
                    );
                    this.view.setViewData(content, false);
                    this.utils.publishSwitchEvent();
                    this.view.activeComponent?.render();
                }
            }
        );

        this.view.app.workspace.on('css-change', async () => {
            await this.view.activeComponent?.controller.themeController.themeUpdate();
        });

        this.view.plugin.observer.subscribe(
            this.view.plugin.app.workspace,
            EventID.OpenAPIThemeChangeState,
            async (event: OpenAPIThemeChangeState) => {
                const viewMode = event.data.mode as RenderingMode;
                if (viewMode !== this.view.mode) {
                    return;
                }
                await this.view.activeComponent?.controller.themeController.themeUpdate();
            }
        );
    }

    async addAnchor(anchorData: AnchorData) {
        const result = await this.view.plugin.workerHelper.sendMessage({
            type: MessageType.AddAnchor,
            payload: {
                data: {
                    path: this.view.file?.path,
                    anchorData: anchorData,
                },
            },
        });
        return result.type === ResponseType.Success;
    }

    async getAnchors() {
        const result = await this.view.plugin.workerHelper.sendMessage({
            type: MessageType.GetAnchors,
            payload: {
                data: {
                    path: this.view.file?.path,
                },
            },
        });
        return result.type === ResponseType.Success
            ? (result.payload.data.anchors as AnchorData[])
            : [];
    }

    async deleteAnchor(anchorData: AnchorData) {
        const result = await this.view.plugin.workerHelper.sendMessage({
            type: MessageType.DeleteAnchor,
            payload: {
                data: {
                    path: this.view.file?.path,
                    anchorData: anchorData,
                },
            },
        });
        return result.type === ResponseType.Success;
    }
}
