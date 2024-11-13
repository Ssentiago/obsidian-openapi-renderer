import { EventID } from 'events-management/typing/constants';
import { SwitchModeStateEvent } from 'events-management/typing/interfaces';
import { ExtensionsModal } from 'view/views/OpenAPI/components/source/modals/extensions-modal';
import openAPIFormatter from 'view/views/OpenAPI/components/source/extensions/formatter';
import convertFile from 'view/views/OpenAPI/components/source/extensions/yamlAndJsonConverter';
import { SourceController } from 'view/views/OpenAPI/components/source/controllers/source-controller';

export class SourceUtilController {
    constructor(public controller: SourceController) {}

    /**
     * Initializes the actions for the source component.
     *
     * Adds the following actions to the view:
     *   1. Convert File between JSON and YAML: Converts the file between JSON and YAML.
     *   2. Format: Formats the file according to the OpenAPI specification.
     *   3. Extensions: Opens the extensions modal.
     *
     * Also subscribes to the `SwitchModeState` event of the workspace and removes the actions
     * when the mode is switched.
     *
     * @returns {void} No return value.
     */
    initializeActions(): void {
        const { app, plugin } = this.controller.source.view;
        const { view } = this.controller.source;

        const convertButton = view.addAction(
            'repeat',
            'Convert File between JSON and YAML',
            convertFile(this.controller.source.view, this.controller.source)
        );

        const formatButton = view.addAction(
            'code',
            'Format',
            openAPIFormatter(this.controller.source)
        );

        const extensionsButton = view.addAction(
            'sliders-horizontal',
            'Extensions',
            () => {
                new ExtensionsModal(app, this.controller.source).open();
            }
        );

        plugin.observer.subscribe(
            app.workspace,
            EventID.SwitchModeState,
            async (event: SwitchModeStateEvent) => {
                const leaf = event.data.leaf;
                if (leaf === this.controller.source.view.leaf) {
                    convertButton.remove();
                    formatButton.remove();
                    extensionsButton.remove();
                }
            }
        );
    }
}
