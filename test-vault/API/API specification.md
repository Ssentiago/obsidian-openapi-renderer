
```dataviewjs
const { Platform } = require("obsidian");
const { MarkdownView } = require("obsidian")

function relativePathToUrl(relativePath, notePath) {
    const { URL } = require("node:url")
    const noteFullPath = app.vault.adapter.getFullRealPath(notePath).replaceAll("\\", "/");
    const noteUrl = `${Platform.resourcePathPrefix}${noteFullPath}`;
    const relativeUrl = new URL(relativePath, noteUrl);
    return relativeUrl.toString();
}

async function checkExistsFile(htmlFile) {
    const currentFile = dv.current().file;
    const htmlFilePath = `${currentDir}/${htmlFile}`;
    return await app.vault.adapter.exists(htmlFilePath);
}

async function renderIframe({ dv, relativePath, width, height  }) {
    const htmlExists = await checkExistsFile(relativePath);
    if (!htmlExists) {
        dv.el("div", "No HTML file was found. Please re-render this.");
        return;
    }

    if (Platform.isDesktopApp) {
	const refreshButton = dv.el("button", "Refresh", { cls: "refresh-button", onclick: () => {
        const view = app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
            return;
        }
        view.previewMode.rerender(true)
        new Notice('OpenAPI preview manually updated');
        } });

        dv.el("iframe", "", {
            attr: {
               
            }
        });
    } else {
        dv.el("div", `[[${relativePath}|Open swagger-ui]]`);
    }
};


await new Promise(resolve => setTimeout(resolve, 500)); // delay 500 ms before starting dataview script
await renderIframe({ dv, relativePath: "openapi-spec.html", width: '100%', height: '600px' });
```


