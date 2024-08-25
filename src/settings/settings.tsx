import { App, PluginSettingTab } from 'obsidian';
import OpenAPIRendererPlugin from '../core/OpenAPIRendererPlugin';
import { createRoot, Root } from 'react-dom/client';
import EntryComponent from './components/entry-component';

export class OpenAPISettingTab extends PluginSettingTab {
    plugin: OpenAPIRendererPlugin;
    root!: Root;

    constructor(app: App, plugin: OpenAPIRendererPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        const reactRoot = containerEl.createDiv();
        this.root = createRoot(reactRoot);
        this.root.render(
            <EntryComponent app={this.app} plugin={this.plugin} />
        );
    }

    hide(): void {
        this.root.unmount();
    }
}
