import {
    EventObserver,
    EventPublisher,
} from 'events-management/events-management';
import Export from 'export/export';
import { addIcon, Notice, Plugin, TFile, WorkspaceLeaf } from 'obsidian';
import { OpenAPISettingTab } from 'settings/settings';
import SettingsManager, { DefaultSettings } from 'settings/settings-manager';
import { createNewLeaf } from 'ui/common/helpers';
import { EntryView } from 'ui/views/OpenAPI Entry/entry-view';
import { VersionView } from 'ui/views/OpenAPI Version/version-view';
import { ExtensionManager } from 'ui/views/OpenAPI/components/source/managers/extension-manager';
import { OpenAPIView } from 'ui/views/OpenAPI/openapi-view';
import { EventID } from '../events-management/typing/constants';
import { PowerOffEvent } from '../events-management/typing/interfaces';
import { FileWatcher } from '../filewatcher/filewatcher';
import { WorkerHelper } from '../indexedDB/worker/helper';
import LoggingManager from '../logging/logging-manager';
import {
    OPENAPI_ENTRY_VIEW,
    OPENAPI_VERSION_VIEW,
    OPENAPI_VIEW,
} from '../ui/typing/types';

export default class OpenAPIRendererPlugin extends Plugin {
    settings!: DefaultSettings;
    settingsTab!: OpenAPISettingTab;
    logger!: LoggingManager;
    publisher!: EventPublisher;
    observer!: EventObserver;
    settingsManager!: SettingsManager;
    export!: Export;
    fileWatcher!: FileWatcher;
    workerHelper!: WorkerHelper;
    sourceExtensionsManager!: ExtensionManager;

    /**
     * Lifecycle method called when the plugin is loaded.
     *
     * This method initializes the plugin and all its components.
     *
     * @returns A promise that resolves when the plugin has been initialized.
     */
    async onload(): Promise<void> {
        await this.initializePlugin();
    }

    /**
     * Lifecycle method called when the plugin is unloaded.
     *
     * This method cleans up after the plugin by publishing a `PowerOffEvent` to notify other components that the plugin
     * is no longer active.
     *
     * @returns A promise that resolves when the plugin has been unloaded.
     */
    async onunload(): Promise<void> {
        const event = {
            eventID: EventID.PowerOff,
            timestamp: new Date(),
            emitter: this.app.workspace,
        } as PowerOffEvent;
        this.publisher.publish(event);
        this.observer.unsubscribeAll();
    }

    /**
     * Initializes the plugin by creating and loading core components, setting up event listeners,
     * establishing networking connections, creating UI components, and initializing utility classes.
     *
     * This method is called when the plugin is loaded.
     *
     * @returns A promise that resolves when the plugin has been initialized.
     */
    private async initializePlugin(): Promise<void> {
        this.initializeManagers();
        await this.initializeCore();
        this.initializeEventSystem();
        await this.initializeUI();
        await this.initializeUtilities();
        this.addSettingTab(new OpenAPISettingTab(this.app, this));
    }

    /**
     * Initializes the core components of the plugin.
     *
     * This method creates and initializes the settings manager, logger, and resource manager.
     *
     * @returns A promise that resolves when the core components have been initialized.
     */
    private async initializeCore(): Promise<void> {
        await this.settingsManager.loadSettings();
        this.logger = new LoggingManager(this);
        this.workerHelper = new WorkerHelper();
    }

    /**
     * Initializes the plugin's managers.
     *
     * This method creates and initializes the settings manager and source extensions manager.
     *
     * @private
     * @returns {void} No return value.
     */
    private initializeManagers(): void {
        this.settingsManager = new SettingsManager(this);
        this.sourceExtensionsManager = new ExtensionManager(this);
    }

    /**
     * Initializes the event system components of the plugin.
     *
     * This method creates and initializes the event publisher and observer.
     *
     * @private
     */
    private initializeEventSystem(): void {
        this.publisher = new EventPublisher(this);
        this.observer = new EventObserver(this);
    }

    /**
     * Initializes the UI components of the plugin.
     *
     * This method registers three views: `OpenAPIView`, `VersionView`, and `EntryView`.
     * It also registers extensions for YAML, YML, and JSON files so that they can be opened with the
     * `OpenAPIView` by default.
     *
     * Additionally, this method adds a ribbon icon for opening the `EntryView` and a command
     * for opening the `EntryView` from the command palette.
     *
     * @returns A promise that resolves when the UI components have been initialized.
     */
    private async initializeUI(): Promise<void> {
        this.registerView(OPENAPI_VIEW, (leaf) => new OpenAPIView(leaf, this));

        if (this.settings.registerYamlJson) {
            this.registerExtensions(['yaml', 'yml', 'json'], OPENAPI_VIEW);
        }

        this.app.workspace.on('file-menu', (menu, file) => {
            if (!(file instanceof TFile)) {
                return;
            }

            if (
                !['yaml', 'yml', 'json'].includes(file.extension.toLowerCase())
            ) {
                return;
            }
            menu.addItem((item) => {
                item.setIcon('circle-dot');
                item.setTitle('Open in OpenAPI View');
                item.onClick(async () => {
                    const leaf = this.app.workspace.getLeaf(true);
                    await leaf.setViewState({
                        type: OPENAPI_VIEW,
                        active: true,
                        state: {
                            file: file.path,
                        },
                    });
                    await this.app.workspace.revealLeaf(leaf);
                });
            });
        });

        this.registerView(
            OPENAPI_VERSION_VIEW,
            (leaf: WorkspaceLeaf) => new VersionView(leaf, this)
        );

        this.registerView(
            OPENAPI_ENTRY_VIEW,
            (leaf: WorkspaceLeaf) => new EntryView(leaf, this)
        );

        this.addRibbonIcon('view', 'Open OpenAPI Entry View', async () => {
            const leaf = this.app.workspace.getLeaf(true);
            await leaf.setViewState({
                type: OPENAPI_ENTRY_VIEW,
                active: true,
            });
            await this.app.workspace.revealLeaf(leaf);
        });

        this.addCommand({
            id: 'openapi-renderer-open-openapi-entry',
            name: 'OpenAPI Entry',
            icon: 'file-search-2',
            callback: async () => {
                const leaf = this.app.workspace.getLeaf(true);
                await leaf.setViewState({
                    type: OPENAPI_ENTRY_VIEW,
                    active: true,
                });
                await this.app.workspace.revealLeaf(leaf);
            },
        });

        this.registerObsidianProtocolHandler(
            'openapi-open',
            async ({ openapiPath, line }) => {
                if (!openapiPath || !line) {
                    return;
                }

                const existsPath =
                    await this.app.vault.adapter.exists(openapiPath);

                if (!existsPath) {
                    this.showNotice(
                        'Invalid URI provided: file does not exist.'
                    );
                    return;
                }

                const isValidOpenApi = Boolean(
                    openapiPath.match(/\.(json|yaml|yml)$/i)
                );

                if (!isValidOpenApi) {
                    this.showNotice(
                        'Invalid URI provided: unsupported file format.'
                    );
                    return;
                }

                const leaf = this.app.workspace.getLeaf(true);
                await leaf.setViewState({
                    type: OPENAPI_VIEW,
                    active: true,
                    state: { file: openapiPath },
                });

                await this.app.workspace.revealLeaf(leaf);
                const view = leaf.view as OpenAPIView;
                const editor = view.source.editor;
                if (!editor) {
                    return;
                }
                const pos = editor.state.doc.line(Number(line)).from;
                if (pos) {
                    editor.dispatch({
                        selection: {
                            anchor: pos,
                            head: pos,
                        },
                        scrollIntoView: true,
                    });
                }
            }
        );

        addIcon('green-dot', `<circle cx="50" cy="50" r="30" fill="green" />`);
        addIcon(
            'yellow-dot',
            `<circle cx="50" cy="50" r="30" fill="yellow" />`
        );
    }

    /**
     * Initializes the utility components of the plugin.
     *
     * This method creates instances of several utility classes:
     * - `StateChecker`: This utility checks the state of the plugin, determining if it is being launched for the first time or if there are updates available. It shows appropriate notifications based on its findings.
     * - `FileWatcher`: This utility monitors file changes in the workspace, allowing the plugin to respond to file renames
     * - `Export`: This utility handles the export functionality of the plugin and is utilized in views to allow users to export specifications
     *
     * It also checks the plugin's state by invoking `checkState` on the `StateChecker`.
     *
     * @returns A promise that resolves when all utility components have been initialized.
     */
    private async initializeUtilities(): Promise<void> {
        this.fileWatcher = new FileWatcher(this);
        this.export = new Export(this);
    }

    /**
     * Displays a notice to the user with the given message.
     *
     * @param message The message to be displayed to the user.
     * @param duration The duration, in milliseconds, that the notice should be displayed.
     * @param messageType The message type of the notice.
     */
    showNotice(message: string, duration?: number): void {
        new Notice(message, duration);
    }
}
