import { ApiRefOptions, ApiRefResolution } from '@apiture/api-ref-resolver';
import { ApiRefResolver } from '@apiture/api-ref-resolver/lib/src/ApiRefResolver';
import { EventID } from 'events-management/typing/constants';
import {
    SourceChangedEvent,
    PreviewStateEvent,
    SwitchModeStateEvent,
} from 'events-management/typing/interfaces';
import path from 'path';
import { convertData, updateButton } from 'view/common/helpers';
import OpenAPIPreviewController from 'view/OpenAPI/components/preview/controllers/preview-controller';

export class PreviewUtilController {
    constructor(private readonly controller: OpenAPIPreviewController) {}

    /**
     * Loads the OpenAPI specification from the current file.
     *
     * This method is called when the preview mode opens in `full mode` (full mode is when user not in grouped mode).
     * It resolves any $refs in the specification and returns the resolved specification.
     * If there is an error resolving the specification, it shows a notice and logs the error,
     * and returns `null`.
     *
     * @returns {Promise<object | null>} A promise that resolves to the resolved OpenAPI
     *          specification, or `null` if there was an error.
     */
    async loadSpec(): Promise<object | null> {
        const file = this.controller.preview.openAPIView.file;
        if (!file) {
            return null;
        }
        const relativePath = file.path;
        const basePath =
            this.controller.preview.plugin.app.vault.adapter.basePath;

        const resolver = new ApiRefResolver(path.join(basePath, relativePath));
        const options: ApiRefOptions = {
            verbose: false,
            conflictStrategy: 'rename',
        };

        let out: ApiRefResolution;
        try {
            out = await resolver.resolve(options);
        } catch (err: any) {
            this.controller.preview.plugin.showNotice(
                'Oops... Something went wrong while resolving $refs. ' +
                    'Please ensure your spec file is valid and check ' +
                    'the logs for more details.',
                1000
            );
            this.controller.preview.plugin.logger.error(err.message);
            return null;
        }
        this.publishStateEvent('full');
        return out.api as object;
    }

    /**
     * Used when user is in `fast mode` (linked-view mode) and changes linked file content in another editor.
     *
     * It converts the file data to a JSON object based on the file extension.
     * If the file extension is not JSON or YAML, it returns `null`.
     *
     * @returns {Record<string, any> | null} The converted JSON object, or
     *          `null` if the file extension is not JSON or YAML.
     */
    onChangeLoadSpec(): Record<string, any> | null {
        const data = this.controller.preview.openAPIView.data;
        const ext = this.controller.preview.openAPIView.file?.extension ?? '';
        try {
            const converted = convertData(data, ext);
            this.publishStateEvent('fast');
            return converted;
        } catch (err: any) {
            return null;
        }
    }

    /**
     * Sets up event listeners.
     *
     * This method sets up an event listener for changes to the current
     * file in the workspace. If the file is the one currently being
     * previewed, and the file is in preview mode, it will re-render
     * the preview when the file changes.
     *
     * @returns {void} No return value.
     */
    setupEventListeners(): void {
        const { plugin } = this.controller.preview.openAPIView;
        plugin.observer.subscribe(
            plugin.app.workspace,
            EventID.EditorChanged,
            async (event: SourceChangedEvent) => {
                const file = event.data.file;
                const isMatchingView =
                    this.controller.preview.openAPIView.file?.path === file;
                const isPreviewMode =
                    this.controller.preview.openAPIView.mode === 'preview';
                if (isMatchingView && isPreviewMode) {
                    await this.controller.renderController.updatePreview(
                        this.onChangeLoadSpec()
                    );
                }
            }
        );
    }

    /**
     * Returns a string explaining the current rendering mode.
     *
     * @param {boolean} isFullState - `true` if the preview is currently in full
     *        rendering mode, `false` otherwise.
     * @returns {string} A string explaining the current rendering mode.
     */
    getDotMsg(isFullState: boolean): string {
        if (isFullState) {
            return `You are currently in full preview mode. 
In this mode, when you modify the specification file and add new external reference links, 
these references will be captured and processed during rendering.`;
        }
        return `You are currently in linked preview mode. 
In this mode, any changes to the specification file that introduce new external reference links 
will not be processed automatically. To capture and resolve these references, please click the rerender button.`;
    }

    /**
     * Initializes the actions for the preview component.
     *
     * This method:
     * - Sets up a `Re-render preview` button that re-renders the preview when clicked.
     * - Sets up a `state` button that shows a notice explaining the current
     *   rendering mode when clicked.
     * - Sets up an event listener for the `PreviewStateEvent` that updates the button color
     *   based on whether the preview is in full or fast rendering mode.
     * - Sets up an event listener for the `SwitchModeStateEvent` that removes the actions
     *   when the mode is switched.
     *
     * @returns {void} No return value.
     */
    initializeActions(): void {
        const rerenderButton = this.controller.preview.openAPIView.addAction(
            'rotate-ccw',
            'Re-render preview',
            async () => {
                await this.controller.renderController.rerender();
                this.controller.preview.plugin.showNotice('Re-rendered!');
            }
        );

        const stateButton = this.controller.preview.openAPIView.addAction(
            'dot',
            `Full-rendering mode`,
            async () => {
                const isFullState = !!stateButton.querySelector('.green-dot');
                this.controller.preview.plugin.showNotice(
                    this.getDotMsg(isFullState),
                    15000
                );
            }
        );

        let timeout: NodeJS.Timeout | undefined = undefined;

        this.controller.preview.plugin.observer.subscribe(
            this.controller.preview.plugin.app.workspace,
            EventID.PreviewState,
            async () => {
                const leaves =
                    this.controller.preview.plugin.app.workspace.getGroupLeaves(
                        'openapi-renderer-view-group'
                    );
                const thisLeaf = this.controller.preview.openAPIView.leaf;

                if (leaves.includes(thisLeaf)) {
                    updateButton(
                        stateButton,
                        'yellow-dot',
                        'Fast-rendering mode'
                    );
                } else {
                    updateButton(
                        stateButton,
                        'green-dot',
                        'Full-rendering mode'
                    );
                }
                stateButton.addClass('indicator');
                timeout = setTimeout(() => {
                    stateButton.removeClass('indicator');
                    clearTimeout(timeout);
                }, 2000);
            }
        );

        this.controller.preview.plugin.observer.subscribe(
            this.controller.preview.plugin.app.workspace,
            EventID.SwitchModeState,
            async (event: SwitchModeStateEvent) => {
                if (
                    event.data.leaf === this.controller.preview.openAPIView.leaf
                ) {
                    rerenderButton.remove();
                    stateButton.remove();
                }
            }
        );
    }

    /**
     * Publishes a preview state event with the given state.
     *
     * @param {('full'|'fast')} state - The state of the preview.
     *
     * @returns {void}
     */
    publishStateEvent(state: 'full' | 'fast'): void {
        this.controller.preview.plugin.publisher.publish({
            eventID: EventID.PreviewState,
            timestamp: new Date(),
            emitter: this.controller.preview.plugin.app.workspace,
            data: {
                state: state,
            },
        } as PreviewStateEvent);
    }
}
