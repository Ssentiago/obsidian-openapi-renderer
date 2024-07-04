### OpenAPI Renderer Plugin for Obsidian

This plugin generates a Swagger-UI interface and embeds it as an iframe in the current view of a note. It works in two modes:
- Desktop app: Adds an iframe
- Other devices: Adds a clickable HTML link to view Swagger UI in a browser

### Important notes:
- Plugin searches for a YAML or JSON file in the current folder of the opened note. OpenAPI specification should be in YAML / JSON format in the same folder. Make sure that the name of the specification file corresponds to the plugin setting
- By default, generates HTML file named openapi-spec.html in the folder with YAML file.
- Default OpenAPI specification filename is "openapi-spec.yaml" in the same folder.
- Needs internet access to download Swagger UI and js-yaml from CDNs.
- Uses DataviewJS for iframe/link rendering. Install Dataview plugin and enable JS script settings in its settings.


### Installation
- Copy plugin files to obsidian/plugins/openapi-renderer/ in your Obsidian vault.
- Enable plugin in Obsidian settings (Settings → Third-party plugins).

### Usage
- Open note in same directory as OpenAPI YAML/JSON file.
- Press Ctrl+Shift+O (or Cmd+Shift+O on Mac) to generate HTML and insert DataviewJS script.
- Swagger UI should appear in your note if everything's okay.

### Settings
Customize in plugin settings:
- Generated HTML filename
- OpenAPI specification filename
- Iframe dimensions (width and height)
- Auto-update toggle for preview. Note that next to the plugin preview, you also have a manual update button on the top left

### Credits 
Special thanks to [mnaoumov](https://github.com/mnaoumov/) for providing the initial DataviewJS script to render local files in an iframe, which served as the foundation for this plugin's functionality.
