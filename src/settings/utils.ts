import {
    App,
    DropdownComponent,
    TextComponent,
    ToggleComponent,
} from 'obsidian';
import OpenAPIRendererPlugin from '../core/OpenAPIRendererPlugin';
import { OpenAPIRendererEventPublisher } from '../events-management/events-management';

export type ComponentType = DropdownComponent | TextComponent | ToggleComponent;

/**
 * Utility class for managing settings-related operations in the OpenAPI Renderer plugin.
 */
export default class SettingsUtils {
    app: App;
    plugin: OpenAPIRendererPlugin;
    publisher: OpenAPIRendererEventPublisher;

    constructor(
        app: App,
        plugin: OpenAPIRendererPlugin,
        publisher: OpenAPIRendererEventPublisher
    ) {
        this.app = app;
        this.plugin = plugin;
        this.publisher = publisher;
    }

    /**
     * Creates and configures a linked component with optional extra information.
     *
     * @param containerEl - The HTML element where the setting will be added.
     * @param name - The name of the setting.
     * @param desc - The description of the setting.
     * @param type - The type of component to create (`dropdown` or `toggle`).
     * @param options - Options for dropdown components, if applicable.
     * @param setValue - The initial value for the component.
     * @param tooltips - Tooltips to display for different values.
     * @param onChange - Callback function to execute when the value changes.
     *
     * @returns The created Setting instance with the linked component.
     */
}
