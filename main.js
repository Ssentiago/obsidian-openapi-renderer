const obsidian = require('obsidian');
const path = require('path');

const dataviewjsScript = `
\`\`\`dataviewjs

const { Platform } = require("obsidian");

function relativePathToUrl(relativePath, notePath) {
 const { URL } = require("node:url")
  const noteFullPath = app.vault.adapter.getFullRealPath(notePath).replaceAll("\\\\", "/");
  const noteUrl = \`\${Platform.resourcePathPrefix}\${noteFullPath}\`;
  const relativeUrl = new URL(relativePath, noteUrl);
  return relativeUrl.toString();
}


function renderIframe({ dv, relativePath, width = "100%", height = "600px" }) {
  if (Platform.isDesktopApp) {
    dv.el("iframe", "", {
      attr: {
        src: relativePathToUrl(relativePath, dv.current().file.path),
        width,
        height
      }
    });
  } else {
    dv.el("div", \`[[openapi-spec.html|Открыть swagger-ui]]\`);
}
};

renderIframe({ dv, relativePath: "openapi-spec.html" });

\`\`\`
`

class OpenAPIPlugin extends obsidian.Plugin {
  async onload() {
    this.addCommand({
      id: 'render-openapi',
      name: 'Render OpenAPI Spec',
      callback: () => this.renderOpenAPISpec(),
      hotkeys: [{ modifiers: ["Mod", "Shift"], key: "o" }]
    });
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
    const htmlFileName = 'openapi-spec.html';
    const htmlFilePath = path.join(currentDir, htmlFileName);
    await this.app.vault.adapter.write(htmlFilePath, htmlContent);

    // Create a relative path from the current file to the HTML file
    const relativePath = path.relative(path.dirname(currentFile.path), htmlFilePath);

    // Clear the current view and insert the new link
    const editor = activeView.editor;
    const currentContent = editor.getValue();
    const dataviewjsScriptPresent = currentContent.includes(dataviewjsScript)

    if (dataviewjsScriptPresent) {
      new obsidian.Notice('New HTML was Rendered. Please Look At This');

    } else {
       editor.setValue(dataviewjsScript + '\n\n' + currentContent)
       new obsidian.Notice('OpenAPI Specification rendered and dataviewjs script inserted.');
    }

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

module.exports = OpenAPIPlugin;
