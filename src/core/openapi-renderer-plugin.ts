import {
    EventObserver,
    EventPublisher,
} from 'events-management/events-management';
import Export from 'export/export';
import { addIcon, Notice, Plugin, TFile } from 'obsidian';
import { OpenAPISettingTab } from 'settings/settings';
import SettingsManager, { DefaultSettings } from 'settings/settings-manager';
import { ExtensionManager } from 'ui/views/OpenAPI/components/source/managers/extension-manager';
import { OpenAPIView } from 'ui/views/OpenAPI/openapi-view';

import { EventID } from '../events-management/typing/constants';
import { PowerOffEvent } from '../events-management/typing/interfaces';
import LoggingManager from '../logging/logging-manager';
import { OPENAPI_VIEW } from '../ui/typing/types';

export default class OpenAPIRendererPlugin extends Plugin {
    declare settings: DefaultSettings;
    settingsTab!: OpenAPISettingTab;
    logger!: LoggingManager;
    publisher!: EventPublisher;
    observer!: EventObserver;
    settingsManager!: SettingsManager;
    export!: Export;
    sourceExtensionsManager!: ExtensionManager;

    /**
     * Lifecycle method called when the plugin is loaded.
     *
     * This method initializes the plugin and all its components.
     * Initialization continues asynchronously after this method returns.
     *
     * @returns {void} No return value.
     */
    onload(): void {
        void this.initializePlugin();
    }

    /**
     * Lifecycle method called when the plugin is unloaded.
     *
     * This method cleans up after the plugin by publishing a `PowerOffEvent` to notify other components that the plugin
     * is no longer active.
     *
     * @returns {void} No return value.
     */
    onunload(): void {
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
     * This method creates and initializes the settings manager and logger.
     *
     * @returns A promise that resolves when the core components have been initialized.
     */
    private async initializeCore(): Promise<void> {
        await this.settingsManager.loadSettings();
        this.logger = new LoggingManager(this);
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
     * This method registers the `OpenAPIView` and extensions for YAML, YML, and JSON files so
     * that they can be opened with the `OpenAPIView` by default. It also adds a file menu item
     * for opening a specification in the OpenAPI View and registers the `openapi-open` protocol
     * handler for deep links into a specification file.
     *
     * @returns A promise that resolves when the UI components have been initialized.
     */
    private async initializeUI(): Promise<void> {
        this.registerView(OPENAPI_VIEW, (leaf) => new OpenAPIView(leaf, this));

        if (this.settings.registerYamlJson) {
            this.registerExtensions(['yaml', 'yml', 'json'], OPENAPI_VIEW);
        }

        this.registerEvent(
            this.app.workspace.on('file-menu', (menu, file) => {
                if (!(file instanceof TFile)) {
                    return;
                }

                if (
                    !['yaml', 'yml', 'json'].includes(
                        file.extension.toLowerCase()
                    )
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
            })
        );

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
     * Initializes the utility components of the plugin and registers export commands.
     *
     * This method creates the `Export` utility, which renders specification files as
     * standalone Swagger UI pages, and registers the commands that trigger it.
     *
     * @returns A promise that resolves when all utility components have been initialized.
     */
    private async initializeUtilities(): Promise<void> {
        this.export = new Export(this);

        this.addCommand({
            id: 'export-html',
            name: 'Export current OpenAPI as standalone HTML',
            icon: 'file-code-2',
            callback: async () => {
                const file = this.app.workspace.getActiveFile();
                if (
                    !file ||
                    !['yaml', 'yml', 'json'].includes(
                        file.extension.toLowerCase()
                    )
                ) {
                    this.showNotice('Open an OpenAPI file first');
                    return;
                }
                await this.export.exportCurrent(file);
            },
        });

        this.addCommand({
            id: 'export-zip',
            name: 'Export all OpenAPI files as ZIP',
            icon: 'file-archive',
            callback: async () => {
                await this.export.exportAll();
            },
        });
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
