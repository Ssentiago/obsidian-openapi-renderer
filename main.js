const obsidian = require('obsidian');
const path = require('path');

const DEFAULT_SETTINGS = {
    htmlFileName: 'openapi-spec.html',
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
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
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
        const yamlFile = this.app.vault.getFiles()
            .find(file => (file.extension === 'yaml' || file.extension === 'yml') &&
                          path.dirname(file.path) === currentDir);

        if (!yamlFile) {
            new obsidian.Notice('No YAML file found in the current directory');
            return;
        }

        // Get the content of the YAML file
        let yamlContent = await this.app.vault.adapter.read(yamlFile.path);
        // Replace tab characters with spaces
        yamlContent = yamlContent.replace(/\t/g, '    ');

        // Create HTML file with Swagger UI and embedded YAML content
        const htmlContent = this.generateSwaggerUIHTML(yamlContent);
        const htmlFilePath = path.join(currentDir, this.settings.htmlFileName);
        await this.app.vault.adapter.write(htmlFilePath, htmlContent);

        // Clear the current view and insert the new link
        const editor = activeView.editor;
        const currentContent = editor.getValue();
        const dataviewjsScript = this.generateDataviewJSScript();
        const dataviewjsScriptPresent = currentContent.includes(dataviewjsScript)

        if (dataviewjsScriptPresent) {
            new obsidian.Notice('New HTML was Rendered. Please Look At This');
        } else {
            editor.setValue(dataviewjsScript + '\n\n' + currentContent)
            new obsidian.Notice('OpenAPI Specification rendered and dataviewjs script inserted.');
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

async function renderIframe({ dv, relativePath, width = "${this.settings.iframeWidth}", height = "${this.settings.iframeHeight}" }) {
    const htmlExists = await checkExistsFile(relativePath);
    if (!htmlExists) {
        dv.el("div", "No HTML file was found. Please re-render this.");
        return;
    }

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

await renderIframe({ dv, relativePath: "${this.settings.htmlFileName}" });
\`\`\`
`;
    }

    generateSwaggerUIHTML(yamlContent) {
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
            const spec = jsyaml.load(${JSON.stringify(yamlContent)});
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
        // Clean up if necessary
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
    }
}

module.exports = OpenAPIPlugin;
