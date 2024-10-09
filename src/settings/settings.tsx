import { App, PluginSettingTab } from 'obsidian';
import OpenAPIRendererPlugin from '../core/openapi-renderer-plugin';
import { createRoot, Root } from 'react-dom/client';
import Application from 'settings/components/application';

export class OpenAPISettingTab extends PluginSettingTab {
    root!: Root;

    constructor(
        app: App,
        public plugin: OpenAPIRendererPlugin
    ) {
        super(app, plugin);
    }

    /**
     * This method is called whenever the user navigates to this settings tab.
     * It will render the `EntryComponent` in the given container element.
     * The `EntryComponent` is a React component that renders the main content of the settings tab.
     * @returns {void}
     */
    display(): void {
        const { containerEl } = this;
        containerEl.addClass('openapi-renderer-settings-page');
        const reactRoot = containerEl.createDiv();
        this.root = createRoot(reactRoot);
        this.root.render(<Application app={this.app} plugin={this.plugin} />);
    }

    /**
     * This method is called whenever the user navigates away from this settings tab.
     * It will unmount the React component rendered in the `display` method.
     * @returns {void}
     */
    hide(): void {
        this.root.unmount();
    }
}
