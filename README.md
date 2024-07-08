### OpenAPI Renderer Plugin for Obsidian

This plugin generates a Swagger-UI interface and embeds it as an iframe in the current view of a note.

### Important notes:
- Plugin searches for a YAML or JSON file in the current folder of the opened note. OpenAPI specification should be in YAML / JSON format in the same folder. Make sure that the name of the specification file corresponds to the plugin setting
- By default, generates HTML file named openapi-spec.html in the folder with YAML file.
- Default OpenAPI specification filename is "openapi-spec.yaml" in the same folder.
- Needs internet access to download Swagger UI and js-yaml from CDNs.
- There are two ways to update the Swagger UI preview:
  - Manual (by default): after changing the HTML file, call the Refresh Swagger UI command (Ctrl + L by default)
  - Automatic: enable the 'Auto Update' option in the plugin settings. When you update 
    specification from an external application and save a file with it, the plugin tracks 
    saves the file and generates a new HTML file and also updates the iframe.

### Known issues
- When using the "VSCode Editor" plugin to edit YAMl/JSON specification files there may be 
  problems with automatic updates. Use manual update or edit 
  specification in an external tool (for example, notepad)


### Installation
- Copy plugin files to .obsidian/plugins/openapi-renderer/ in your Obsidian vault.
- Enable plugin in Obsidian settings (Settings → Community plugins).

### Usage
- Open note in same directory as OpenAPI YAML/JSON file.
- Press Ctrl+Shift+O (or Cmd+Shift+O on Mac) to generate HTML and insert iframe.
- Swagger UI should appear in your note if everything's okay.

### Demonstration
![2024-07-05 19-20-03](https://github.com/Ssentiago/openapi-renderer/assets/76674116/25cfc3b8-347b-4c0a-acfe-0c5bf3849d14)

### Settings
Customize in plugin settings:
- Generated HTML filename
- OpenAPI specification filename
- Iframe dimensions (width and height)
- Auto-update of HTML and preview.

### Keymap 
By default: 
- Render OpenAPI Swagger UI set to Ctrl + O keys
- Refresh OpenAPI Swagger UI set to Ctrl + L keys

### Credits 
Special thanks to [mnaoumov](https://github.com/mnaoumov/) for valuable insights and contributions, which greatly supported the development of this plugin.



