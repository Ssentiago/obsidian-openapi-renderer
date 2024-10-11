import { eventID } from 'events-management/typing/constants';
import { SwitchModeStateEvent } from 'events-management/typing/interfaces';
import { OpenAPIController } from './view-controller';

export class UtilController {
    constructor(public controller: OpenAPIController) {}

    /**
     * Opens a new leaf of the same type as the current leaf in the specified mode.
     *
     * @param mode The mode to open the new leaf in. Can be either 'split' or 'window'.
     * @param oldState The state of the leaf to open.
     *
     * @returns A promise that resolves when the new leaf is opened.
     */
    async openLeaf(mode: 'split' | 'window', oldState: any): Promise<void> {
        this.controller.view.leaf.setGroup('openapi-renderer-view-group');
        const leaf = this.controller.view.app.workspace.getLeaf(mode);
        await leaf.setViewState({
            ...oldState,
        });
        leaf.setGroup('openapi-renderer-view-group');
        this.controller.view.leaf.setGroupMember(leaf);
    }

    /**
     * Publishes a `SwitchModeState` event.
     *
     * The event is published when the user switches between modes in the view.
     * The event contains the leaf
     *
     * @returns {void} No return value.
     */
    publishSwitchEvent(): void {
        this.controller.view.plugin.publisher.publish({
            eventID: eventID.SwitchModeState,
            timestamp: new Date(),
            emitter: this.controller.view.app.workspace,
            data: {
                leaf: this.controller.view.leaf,
            },
        } as SwitchModeStateEvent);
    }
}
