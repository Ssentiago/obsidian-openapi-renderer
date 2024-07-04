const obsidian = require('obsidian');
const path = require('path');

const DEFAULT_SETTINGS = {
    htmlFileName: 'openapi-spec.html',
    openapiSpecFileName: 'openapi-spec.yaml',
    iframeWidth: '100%',
    iframeHeight: '600px'
};

class OpenAPIPlugin extends obsidian.Plugin {
    settings;

    async onload() {
        await this.loadSettings();

        this.addCommand({
            id: 'render-openapi',
            name: 'Render OpenAPI Spec',
            callback: () => this.renderOpenAPISpec(),
            hotkeys: [{ modifiers: ["Mod", "Shift"], key: "o" }]
        });

        this.addSettingTab(new OpenAPISettingTab(this.app, this));


        this.registerEvent(
            this.app.vault.on('modify', (file) => {
                if (file.path.endsWith(this.settings.htmlFileName)) {
                    this.scheduleUpdate();
                }
            })
        );
    }

    scheduleUpdate() {
        // Отменяем предыдущий запланированный update, если он есть
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }

        // Планируем новый update через 2 секунды
        this.updateTimeout = setTimeout(() => {
            this.updatePreview();
        }, 2000);
    }

    updatePreview() {
        const view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
        if (view && this.settings.autoUpdate) {
            view.previewMode.rerender(true);
            new obsidian.Notice('OpenAPI preview was automatically updated');
        }
    }
        



    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async getOpenApiSpec(currentDir) {
        const specFileName = this.settings.openapiSpecFileName;
        const specFilePath = path.join(currentDir, specFileName);

        try {
            const content = await this.app.vault.adapter.read(specFilePath);
            const fileExtension = path.extname(specFileName).toLowerCase();

            if (fileExtension === '.json') {
                return content;
            } else if (fileExtension === '.yaml' || fileExtension === '.yml') {
                    const yamlContent = content.replace(/\t/g, '    ');
                    return yamlContent;
                
            } 
        } catch (error) {
            if (error.code === 'ENOENT') {
                new obsidian.Notice(`The specification file '${specFileName}' was not found in the current directory`);
            }
            return null;
        }
    }

    async renderOpenAPISpec() {
        const activeView = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
        if (!activeView) {
            new obsidian.Notice('No active Markdown view');
            return;
        }

        const currentFile = activeView.file;
        if (!currentFile) {
            new obsidian.Notice('No file is currently open');
            return;
        }

        const currentDir = path.dirname(currentFile.path);

        const specContent = await this.getOpenApiSpec(currentDir)

        if (!specContent) {
            return;
        }

        // Create HTML file with Swagger UI and embedded YAML content
        const htmlContent = this.generateSwaggerUIHTML(specContent);
        const htmlFilePath = path.join(currentDir, this.settings.htmlFileName);
        await this.app.vault.adapter.write(htmlFilePath, htmlContent);

        const editor = activeView.editor;
        const currentContent = editor.getValue();
        const dataviewjsScript = this.generateDataviewJSScript();
        const dataviewjsScriptPresent = currentContent.includes(dataviewjsScript)

        if (dataviewjsScriptPresent) {
            new obsidian.Notice('New HTML was Rendered. Please Look At This');
        } else {
            editor.setValue(dataviewjsScript + '\n\n' + currentContent)
            new obsidian.Notice('OpenAPI Specification was rendered and DataviewJS script was created.');
        }
    }

    generateDataviewJSScript() {
        return `
\`\`\`dataviewjs
const { Platform } = require("obsidian");

function relativePathToUrl(relativePath, notePath) {
    const { URL } = require("node:url")
    const noteFullPath = app.vault.adapter.getFullRealPath(notePath).replaceAll("\\\\", "/");
    const noteUrl = \`\${Platform.resourcePathPrefix}\${noteFullPath}\`;
    const relativeUrl = new URL(relativePath, noteUrl);
    return relativeUrl.toString();
}

async function checkExistsFile(htmlFile) {
    const currentFile = dv.current().file;
    const currentDir = currentFile.folder;
    const htmlFilePath = \`\${currentDir}/\${htmlFile}\`;
    return await app.vault.adapter.exists(htmlFilePath);
}

async function renderIframe({ dv, relativePath, width = "100%", height = "800px" }) {
    const htmlExists = await checkExistsFile(relativePath);
    if (!htmlExists) {
        dv.el("div", "No HTML file was found. Please re-render this.");
        return;
    }
	const refreshButton = dv.el("button", "Refresh", { cls: "refresh-button", onclick: () => {
        const view = app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
            return;
        }
        view.previewMode.rerender(true)
        new Notice('OpenAPI preview manually updated');
        } });

    if (Platform.isDesktopApp) {
        dv.el("iframe", "", {
            attr: {
                src: relativePathToUrl(relativePath, dv.current().file.path),
                width,
                height
            }
        });
    } else {
        dv.el("div", \`[[\${relativePath}|Открыть swagger-ui]]\`);
    }
};



await renderIframe({ dv, relativePath: "openapi-spec.html" });
\`\`\`
`;
    }

    generateSwaggerUIHTML(specContent) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Swagger UI</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3/swagger-ui.css">
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
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

    onunload() {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
}

class OpenAPISettingTab extends obsidian.PluginSettingTab {
    plugin;

    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        let {containerEl} = this;

        containerEl.empty();

        new obsidian.Setting(containerEl)
            .setName('HTML File Name')
            .setDesc('Name of the generated HTML file')
            .addText(text => text
                .setPlaceholder('openapi-spec.html')
                .setValue(this.plugin.settings.htmlFileName)
                .onChange(async (value) => {
                    this.plugin.settings.htmlFileName = value;
                    await this.plugin.saveSettings();
                }));

        new obsidian.Setting(containerEl)
            .setName("OpenAPI specification filename")
            .setDesc("Must end with .yaml, .yml, or .json")
            .addText(text => {
                text.setPlaceholder('openapi-spec.yaml')
                    .setValue(this.plugin.settings.openapiSpecFileName)
                    .onChange(async (value) => {
                        // We'll handle the actual change in onBlur
                        // to avoid constant validation during typing
                    });

                // Add onBlur event listener
                text.inputEl.addEventListener('blur', async () => {
                    const value = text.inputEl.value;
                    if (this.isValidSpecFileName(value)) {
                        this.plugin.settings.openapiSpecFileName = value;
                        await this.plugin.saveSettings();
                    } else {
                        const oldValue = this.plugin.settings.openapiSpecFileName;
                        new obsidian.Notice(`Invalid file extension. Please use .yaml, .yml, or .json. Reverting to ${oldValue} in 2 seconds.`);
                        
                        // Delay for 2 seconds before reverting to the old value
                        setTimeout(() => {
                            text.setValue(oldValue);
                            new obsidian.Notice(`Reverted to ${oldValue}`);
                        }, 2000);
                    }
                });

                return text;
            });

        new obsidian.Setting(containerEl)
            .setName('iframe Width')
            .setDesc('Width of the iframe')
            .addText(text => text
                .setPlaceholder('100%')
                .setValue(this.plugin.settings.iframeWidth)
                .onChange(async (value) => {
                    this.plugin.settings.iframeWidth = value;
                    await this.plugin.saveSettings();
                }));

        new obsidian.Setting(containerEl)
            .setName('iframe Height')
            .setDesc('Height of the iframe')
            .addText(text => text
                .setPlaceholder('600px')
                .setValue(this.plugin.settings.iframeHeight)
                .onChange(async (value) => {
                    this.plugin.settings.iframeHeight = value;
                    await this.plugin.saveSettings();
                }));


        new obsidian.Setting(containerEl)
            .setName('Auto Update')
            .setDesc('Automatically update the preview of iframe when the HTML file changes')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoUpdate)
                .onChange(async (value) => {
                    this.plugin.settings.autoUpdate = value;
                    await this.plugin.saveSettings();
                }));



    }

    isValidSpecFileName(fileName) {
        const validExtensions = /\.(yaml|yml|json)$/i;
        return validExtensions.test(fileName);
    }
}

module.exports = OpenAPIPlugin;