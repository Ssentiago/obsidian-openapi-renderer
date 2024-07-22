import { OpenAPIPluginContextInterface } from '../typing/interfaces';
import { App } from 'obsidian';
import OpenAPIRendererPlugin from './OpenAPIRendererPlugin';

/**
 * Represents the context object for the OpenAPI plugin, providing access to the main
 * application and the plugin instance.
 */
export default class OpenAPIPluginContext
    implements OpenAPIPluginContextInterface
{
    app: App;
    plugin: OpenAPIRendererPlugin;

    constructor(app: App, plugin: OpenAPIRendererPlugin) {
        this.app = app;
        this.plugin = plugin;
    }
}
