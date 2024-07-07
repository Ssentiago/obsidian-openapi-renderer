const obsidian = require('obsidian');

const DEFAULT_SETTINGS = {
    htmlFileName: 'openapi-spec.html',
    openapiSpecFileName: 'openapi-spec.yaml',
    iframeWidth: '100%',
    iframeHeight: '600px',
    autoUpdate: false,
    theme: 'light'
};

class OpenAPIPluginContext {
    constructor(app, plugin) {
        this.app = app;
        this.plugin = plugin;
    }
};

class OpenAPIRendererPlugin extends obsidian.Plugin {
    settings;
    settingsTab;
    appContext;
    pathHandler;
    openAPI;
    settingsHandler;
    settingsHandler;
    previewHandler;
    eventsHandler;


    async onload() {
        this.openedFiles = new Set();

        this.settingsTab = new OpenAPISettingTab(this.app, this);
        this.appContext = new OpenAPIPluginContext(this.app, this);
        this.pathHandler = new PathHandler(this.appContext);
        this.openAPI = new OpenAPIRenderer(this.appContext, this.pathHandler);
        this.settingsHandler = new SettingsHandler(this.appContext);
        this.previewHandler = new PreviewHandler(this.appContext);
        this.eventsHandler = new EventsHandler(this.appContext);


        await this.settingsHandler.loadSettings();

        this.addSettingTab(this.settingsTab);

        this.addCommand({
            id: 'render-openapi',
            name: 'Render OpenAPI Spec',
            checkCallback: async (checking) => {
                const view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);

                if (view) {
                    if (!checking) {
                        await this.openAPI.renderOpenAPIResources(view);
                    }
                    return true;
                }
                return false;

            },
            hotkeys:
                [{modifiers: ["Mod", "Shift"], key: "o"}]
        });
        this.addCommand({
            id: 'refresh-openapi',
            name: 'Refresh OpenAPI Spec',
            checkCallback: async (checking) => {
                const view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);

                if (view) {
                    if (!checking) {
                        await this.previewHandler.previewManualUpdate(view);
                    }
                    return true;
                }
                return false;

            },
            hotkeys: [{modifiers: ["Mod", "Shift"], key: "l"}]
        });

        this.registerEvent(this.app.workspace.on('file-open', this.eventsHandler.fileOpenEventHandler.bind(this.eventsHandler)));
    }
    onunload() {
        if (this.previewHandler.updateTimeout) {
            clearTimeout(this.previewHandler.updateTimeout);
        }

        this.openedFiles.clear();
    };
};

class SettingsHandler {

    constructor(appContext) {
        this.appContext = appContext;
    }

    async loadSettings() {
        this.appContext.plugin.settings = Object.assign({}, DEFAULT_SETTINGS, await this.appContext.plugin.loadData());
    }

    async saveSettings() {
        await this.appContext.plugin.saveData(this.appContext.plugin.settings);
    }


}

class OpenAPISettingTab extends obsidian.PluginSettingTab {
    plugin;
    modifySpecEvent;

    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }


    display() {
        const {containerEl} = this;

        containerEl.empty();

        new obsidian.Setting(containerEl)
            .setName('HTML File Name')
            .setDesc('Name of the generated HTML file')
            .addText(text => {
                text.setPlaceholder(this.plugin.settings.htmlFileName)
                    .setValue(this.plugin.settings.htmlFileName);

                this.plugin.registerDomEvent(text.inputEl, "blur",
                    this.plugin.eventsHandler.settingsTabInputHtmlBlurHandler.bind(this.plugin.eventsHandler, text));

                text.inputEl.id = 'openapi-html-filename-input';
            });


        new obsidian.Setting(containerEl)
            .setName("OpenAPI specification file name")
            .setDesc("Must end with .yaml, .yml or .json")
            .addText(text => {
                text.setPlaceholder('openapi-spec.yaml')
                    .setValue(this.plugin.settings.openapiSpecFileName);

                this.plugin.registerDomEvent(text.inputEl, 'blur',
                    this.plugin.eventsHandler.settingsTabInputIframeBlurHandler.bind(this.plugin.eventsHandler, text));

                text.inputEl.id = 'openapi-spec-filename-input';
            });


        new obsidian.Setting(containerEl)
            .setName('iframe Width')
            .setDesc('Width of the iframe')
            .addText(text => {
                    text.setPlaceholder('100%')
                        .setValue(this.plugin.settings.iframeWidth);

                    this.plugin.registerDomEvent(text.inputEl, 'blur',
                        this.plugin.eventsHandler.settingsTabInputIframeWidthBlurHanlder.bind(this.plugin.eventsHandler, text));
                    text.inputEl.id = 'openapi-iframe-width-input';
                }
            );

        new obsidian.Setting(containerEl)
            .setName('iframe Height')
            .setDesc('Height of the iframe')
            .addText(text => {

                    text.setPlaceholder('600px')
                        .setValue(this.plugin.settings.iframeHeight);

                    this.plugin.registerDomEvent(text.inputEl, 'blur',
                        this.plugin.eventsHandler.settingsTabInputIframeHeightBlurHandler.bind(this.plugin.eventsHandler, text));
                    text.inputEl.id = 'openapi-iframe-height-input';

                }
            );

        // new obsidian.Setting(containerEl)
        //     .setName('Theme')
        //     .setDesc('Select the theme for Swagger UI')
        //     .addDropdown(dropdown => dropdown
        //         .addOptions({
        //             'light': 'Light',
        //             'dark': 'Dark'
        //         })
        //         .setValue(this.plugin.settings.theme)
        //         .onChange(async (value) => {
        //             this.plugin.settings.theme = value;
        //             await this.plugin.settingsHandler.saveSettings();
        //         }));
        // ;

        new obsidian.Setting(containerEl)
            .setName('Auto Update')
            .setDesc('Automatically update the HTML file and preview of iframe when the OpenAPI Spec file changes')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoUpdate)
                .onChange(async (value) => {
                    this.plugin.settings.autoUpdate = value;
                    await this.plugin.settingsHandler.saveSettings();

                    if (value) {

                        this.modifySpecEvent = this.plugin.eventsHandler.modifyOpenAPISPecEventHandler.bind(this.plugin.eventsHandler);
                        this.plugin.registerEvent(
                            this.app.vault.on('modify', this.modifySpecEvent)
                        );
                        new obsidian.Notice('File modification tracking enabled');
                    } else {
                        if (this.modifySpecEvent) {
                            this.app.vault.off('modify', this.modifySpecEvent);
                            this.modifySpecEvent = null;
                            new obsidian.Notice('File modification tracking disabled');
                        }
                    }
                }));
    }
};

class OpenAPIRenderer {
    constructor(appContext, pathHandler) {
        this.appContext = appContext;
        this.pathHandler = pathHandler;
    };

    async renderOpenAPIResources(view) {

        const currentFile = view.file;

        if (!currentFile) {
            new obsidian.Notice('No file is currently open');
            return;
        }

        const currentDir = currentFile.parent.path;

        const specContent = await this.getOpenAPISpec(currentDir);

        if (!specContent) {
            return;
        }

        const htmlContent = this.generateSwaggerUI(specContent);

        const htmlFileName = this.appContext.plugin.settings.htmlFileName;
        const width = this.appContext.plugin.settings.iframeWidth;
        const height = this.appContext.plugin.settings.iframeHeight;

        const htmlFilePath = currentDir + "/" + htmlFileName;

        await this.appContext.app.vault.adapter.write(htmlFilePath, htmlContent);


        const editor = view.editor;
        const currentContent = editor.getValue();
        if (!currentContent.includes('<iframe id="openapi-iframe"')) {
            const iframe = await this.getIframe(htmlFilePath, width, height);

            editor.setValue(iframe);
        }
        new obsidian.Notice('OpenAPI preview rendered. Use the refresh command to update.');
    };

    resources;

    async getOpenAPISpec(currentDir) {
        const specFileName = this.appContext.plugin.settings.openapiSpecFileName;

        const specFilePath = currentDir + "/" + specFileName;
        const existSpec = await this.pathHandler.checkFileByPath(specFilePath);


        if (existSpec) {
            const content = await this.appContext.app.vault.adapter.read(specFilePath);

            const extension = specFileName.substring(specFileName.lastIndexOf(".") + 1,).toLowerCase();

            switch (extension) {
                case 'yaml':
                case 'yml' :
                    const yamlContent = content.replace(/\t/g, '    ');
                    return yamlContent;
                case 'json':
                    return content;
            }
            ;


        } else {
            new obsidian.Notice('The specification file was not found');
            return null;
        }
    };

    generateSwaggerUI(specContent) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3/swagger-ui.css">
    <style>
        html { box-sizing: border-box; overflow-moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin: 0; background: #fafafa; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js"></script>
    <script>
        window.onload = function() {
            const spec = jsyaml.load(${JSON.stringify(specContent)});
            const ui = SwaggerUIBundle({
                spec: spec,
                dom_id: '#swagger-ui',
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.SwaggerUIStandalonePreset
                ],
                layout: "BaseLayout"
            });
        }
    </script>
</body>
</html>
        `;
    }

    async getIframe(htmlFilePath, width, height) {
        const resourceUrl = this.pathHandler.relativePathToResourceUrl(htmlFilePath);
        return `<iframe id="openapi-iframe" src="${resourceUrl}" width="${width}" height="${height}"></iframe>`;
    }
}

class PathHandler {
    constructor(appContext) {
        this.appContext = appContext;
    };

    fullPathToRelativePath(fullPath) {
        const vaultPath = this.appContext.app.vault.adapter.getBasePath().replaceAll("\\", "/");
        if (fullPath.startsWith(vaultPath)) {
            return fullPath.slice(vaultPath.length + 1);
        }
        return null;
    }

    relativePathToResourceUrl(htmlFilePath) {
        const htmlFullPath = this.appContext.app.vault.adapter.getFullRealPath(htmlFilePath).replaceAll("\\", "/");
        const htmlResourseFullPath = `${obsidian.Platform.resourcePathPrefix}${htmlFullPath}`;
        return htmlResourseFullPath;
    };

    fullPathToResourceUrl(fullHtmlPath) {
        const resourcePath = `${obsidian.Platform.resourcePathPrefix}${fullHtmlPath.replaceAll("\\", "/")}`;
        return resourcePath;
    }

    async checkFileByPath(filepath) {
        return await this.appContext.app.vault.adapter.exists(filepath);
    };

    removeResourcePrefix(path) {
        const newPath = path.match(/app:\/\/.+?\/(.+)/);
        if (newPath) {
            return newPath[1];
        }
        return null;
    }
}

class PreviewHandler {
    constructor(appContext) {
        this.appContext = appContext;
    }

    async scheduleAutoUpdate(file) {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        this.updateTimeout = setTimeout(async () => {
            const view = this.appContext.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
          await this.appContext.plugin.previewHandler.previewAutoUpdate(view);
        }, 2000);
    }

    async previewAutoUpdate(view) {
        if (view && this.appContext.plugin.settings.autoUpdate) {
            await this.appContext.plugin.openAPI.renderOpenAPIResources(view);
            view.previewMode.rerender(true);
            new obsidian.Notice('OpenAPI preview was automatically updated');
        }
    }

    previewManualUpdate(view) {
        if (!view) {
            new obsidian.Notice('No active Markdown view');
            return;
        }
        view.previewMode.rerender(true);
        new obsidian.Notice('OpenAPI preview refreshed');
    }

    async setViewMode(leaf, mode) {
        const state = leaf.getViewState();
        state.state.mode = mode;
        state.state.source = mode === 'source';
        await leaf.setViewState(state);
    }

    async onFirstUpdateIframe(view) {

        const initialMode = view.getMode();
        const leaf = this.appContext.app.workspace.getLeaf();

        if (initialMode !== 'source') {
            await this.setViewMode(leaf, 'source');
        }

        const currentContent = view.editor.getValue();

        const iframeRegex = /(?<=<iframe id="openapi-iframe" src=").+?(?=" width.+?iframe>)/;
        const matchIframe = currentContent.match(iframeRegex);

        if (matchIframe) {
            const htmlFullPath = this.appContext.plugin.pathHandler.removeResourcePrefix(matchIframe[0]);
            const newSrc = htmlFullPath ?
                this.appContext.plugin.pathHandler.fullPathToResourceUrl(htmlFullPath)
                : new obsidian.Notice('It seems your iframe is broken, please select and recreate it');
            const editedContent = currentContent.replace(iframeRegex, `${newSrc}`);
            view.editor.setValue(editedContent);
            await this.setViewMode(leaf, initialMode);
        }


    }


}

class EventsHandler {
    constructor(appContext) {
        this.appContext = appContext;
    }

    fileOpenEventHandler(file) {
        setTimeout(async () => {
            if (file && !this.appContext.plugin.openedFiles.has(file.path)) {
                const view = this.appContext.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
                if (view) {
                    var content = view.editor.getValue();
                    const matchIframe = content.match(/(?<=<iframe id="openapi-iframe" src=").+?(?=" width.+?iframe>)/);
                    if (matchIframe) {
                        this.appContext.plugin.openedFiles.add(file.path);
                        await this.appContext.plugin.previewHandler.onFirstUpdateIframe(view);
                    }
                    ;
                }
            }
            if (file) {
                const view = this.appContext.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
                if (view) {
                    var content = view.editor.getValue();
                    const matchIframe = content.match(/(?<=<iframe id="openapi-iframe" src=").+?(?=" width.+?iframe>)/);
                    if (matchIframe) {
                        const htmlFullPath = this.appContext.plugin.pathHandler.removeResourcePrefix(matchIframe[0]);
                        const relativeHTMLPath = this.appContext.plugin.pathHandler.fullPathToRelativePath(htmlFullPath);
                        const existsHTML = await this.appContext.plugin.pathHandler.checkFileByPath(relativeHTMLPath);
                        !existsHTML && new obsidian.Notice('OpenAPI HTML file not found. Please rerender this.');
                    }
                }
            }
        }, 100);
    };

    // modifyHTMLEventHandler(file) {
    //     if (file.path.endsWith(this.appContext.plugin.settings.htmlFileName)) {
    //        await  this.appContext.plugin.previewHandler.scheduleAutoUpdate();
    //     }
    // };

    async modifyOpenAPISPecEventHandler(file) {
        if (file.path.endsWith(this.appContext.plugin.settings.openapiSpecFileName)) {
           await this.appContext.plugin.previewHandler.scheduleAutoUpdate();
        }
    }

    async settingsTabInputIframeBlurHandler(textComponent, event) {
        const value = textComponent.inputEl.value;
        const validExtensions = /\.(yaml|yml|json)$/i;
        if (validExtensions.test(value)) {
            this.appContext.plugin.settings.openapiSpecFileName = value;
            await this.appContext.plugin.settingsHandler.saveSettings();
        } else {
            const oldValue = this.appContext.plugin.settings.openapiSpecFileName;
            new obsidian.Notice(`Invalid file extension. Please use .yaml, .yml or .json. Return to ${oldValue} after 2 seconds.`);
            setTimeout(() => {
                textComponent.setValue(oldValue);
                new obsidian.Notice(`Reverted to ${oldValue}`);
            }, 2000);
        }
    };

    async settingsTabInputHtmlBlurHandler(textComponent, event) {

        const value = textComponent.inputEl.value;

        if (value.match(/\.html$/)) {
            this.appContext.plugin.settings.htmlFileName = value;
            await this.appContext.plugin.settingsHandler.saveSettings();
        } else {
            const oldValue = this.appContext.plugin.settings.htmlFileName;
            new obsidian.Notice(`Invalid file extension. Please use .html. Return to ${oldValue} after 2 seconds.`);
            setTimeout(() => {
                textComponent.setValue(oldValue);
                new obsidian.Notice(`Reverted to ${oldValue}`);
            }, 2000);
        }
    }

    async settingsTabInputIframeWidthBlurHanlder(textComponent, event) {
        const value = textComponent.inputEl.value;
        if (value.match(/^\d+?(%|px)?$/)) {
            this.appContext.plugin.settings.iframeHeight = value;
            await this.appContext.plugin.settingsHandler.saveSettings();
        } else {
            const oldValue = this.appContext.plugin.settings.iframeWidth;
            new obsidian.Notice(`Invalid iframe width. Please use a number followed by % or px (e.g. "100%", "500px"), or just a number for pixels. Current value "${oldValue}" will be kept.`);
            setTimeout(() => {
                textComponent.setValue(oldValue);
                new obsidian.Notice(`Reverted to ${oldValue}`);
            }, 2000);
        }


    }


    async settingsTabInputIframeHeightBlurHandler(textComponent, event) {
        const value = textComponent.inputEl.value;
        if (value.match(/^\d+?(%|px)?$/)) {
            this.appContext.plugin.settings.iframeHeight = value;
            await this.appContext.plugin.settingsHandler.saveSettings();
        } else {
            const oldValue = this.appContext.plugin.settings.iframeHeight;
            new obsidian.Notice(`Invalid iframe height. Please use a number followed by % or px (e.g. "100%", "500px"), or just a number for pixels. Current value "${oldValue}" will be kept.${oldValue} after 2 seconds"`);
            setTimeout(() => {
                textComponent.setValue(oldValue);
                new obsidian.Notice(`Reverted to ${oldValue}`);
            }, 2000);
        }

    }


}

module.exports = OpenAPIRendererPlugin;