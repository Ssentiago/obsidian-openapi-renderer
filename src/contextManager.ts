import {OpenAPIPluginContextInterface} from "./typing/interfaces";
import {App} from "obsidian";
import OpenAPIRendererPlugin from "./main";

/**
 * Represents the context shared by instances of other classes within the OpenAPI Renderer plugin.
 */
export class OpenAPIPluginContext implements OpenAPIPluginContextInterface {
    app: App;
    plugin: OpenAPIRendererPlugin;

    constructor(app: App, plugin: OpenAPIRendererPlugin) {
        this.app = app;
        this.plugin = plugin;
    }
};

