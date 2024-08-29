import {
    eventID,
    eventPublisher,
    RenderingMode,
    Subject,
} from 'typing/constants';
import { OpenAPIView } from 'view/OpenAPI/OpenAPI-view';
import {
    SwitchModeStateEvent,
    UpdateOpenAPIViewStateEvent,
} from '../../../typing/interfaces';

import { OPENAPI_VERSION_VIEW_TYPE } from '../../types';

export class OpenAPIController {
    constructor(public view: OpenAPIView) {
        this.initializeActions();
        this.setupEventListeners();
    }

    get newMode(): RenderingMode {
        switch (this.view.mode) {
            case RenderingMode.Preview:
                return RenderingMode.Source;
            case RenderingMode.Source:
                return RenderingMode.Preview;
            default:
                throw new Error('Unsupported mode');
        }
    }

    get modeIcon(): 'book-open' | 'pen' {
        return this.view.mode === RenderingMode.Preview ? 'book-open' : 'pen';
    }

    get modeTitle() {
        const currentMode = this.view.mode;
        return `Current view: ${currentMode === RenderingMode.Preview ? 'reading' : 'editing'}\nClick to ${currentMode === RenderingMode.Preview ? 'edit' : 'read'}\nCtrl+Click to open to the right\nAlt+Click to open in floating window`;
    }

    createActions(): {
        versionViewButton: HTMLElement;
        changeModeButton: HTMLElement;
    } {
        const changeModeButton = this.view.addAction(
            this.modeIcon,
            this.modeTitle,
            async (event: MouseEvent) => {
                const oldState = this.view.leaf.getViewState();
                if (event.ctrlKey) {
                    const leaf = this.view.app.workspace.getLeaf('split');
                    await leaf.setViewState({
                        ...oldState,
                    });
                    leaf.setGroup('openapi-renderer-view-group');
                    this.view.leaf.setGroupMember(leaf);
                } else if (event.altKey) {
                    const leaf = this.view.app.workspace.getLeaf('window');
                    await leaf.setViewState({
                        ...oldState,
                    });
                    leaf.setGroup('openapi-renderer-view-group');
                    this.view.leaf.setGroupMember(leaf);
                } else {
                    this.view.onSwitch();
                }
            }
        );
        const versionViewButton = this.view.addAction(
            'file-clock',
            'Version control',
            async () => {
                const file = this.view.file;
                if (!file) {
                    return;
                }

                const openAPIVersionLeaves =
                    this.view.app.workspace.getLeavesOfType(
                        OPENAPI_VERSION_VIEW_TYPE
                    );

                const existingView = openAPIVersionLeaves.find(
                    (leaf) => leaf.getViewState().state.file === file.path
                );

                if (existingView) {
                    const newViewState = {
                        ...existingView.getViewState(),
                        active: true,
                    };
                    await existingView.setViewState(newViewState);
                } else {
                    const newLeaf = this.view.app.workspace.getLeaf(true);
                    await newLeaf.setViewState({
                        type: OPENAPI_VERSION_VIEW_TYPE,
                        active: true,
                        state: {
                            file: file.path,
                        },
                    });
                }
            }
        );

        return { changeModeButton, versionViewButton };
    }

    initializeActions(): void {
        let { changeModeButton, versionViewButton } = this.createActions();
        this.view.plugin.observer.subscribe(
            this.view.plugin.app.workspace,
            eventID.SwitchModeState,
            async (event: SwitchModeStateEvent) => {
                const leaf = event.data.leaf;
                if (leaf === this.view.leaf) {
                    changeModeButton.remove();
                    versionViewButton.remove();
                    const actions = this.createActions();
                    changeModeButton = actions.changeModeButton;
                    versionViewButton = actions.versionViewButton;
                }
            }
        );
    }

    setupEventListeners(): void {
        this.view.containerEl.setAttr('tabindex', '0');
        this.view.contentEl.setAttr('tabindex', '0');
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
            eventID.UpdateOpenAPIViewState,
            async (event: UpdateOpenAPIViewStateEvent) => {
                const file = event.data.file;
                if (this.view.file?.path === file) {
                    const content = await this.view.app.vault.cachedRead(
                        this.view.file
                    );
                    this.view.setViewData(content, false);
                    this.view.plugin.publisher.publish({
                        eventID: eventID.SwitchModeState,
                        publisher: eventPublisher.OpenAPIView,
                        subject: Subject.All,
                        timestamp: new Date(),
                        emitter: this.view.app.workspace,
                        data: {
                            leaf: this.view.leaf,
                        },
                    } as SwitchModeStateEvent);
                    this.view.activeComponent.render();
                }
            }
        );
    }
}
