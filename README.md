### OpenAPI Renderer Plugin for Obsidian

This plugin is designed to generate a Swagger-UI interface and then embed it as an iframe in the current view of a note. It operates in two modes: If the current device is a desktop application, the iframe is added. If it's not, a clickable HTML link is added instead - this allows you to view the Swagger UI in a browser.

### **Important notes:**
- The plugin looks for a YAML file in the current folder of the opened note. Make sure your OpenAPI specification is in YAML format and located in the same folder.
- By default, the plugin generates an HTML file called openapi-spec.html in the folder containing the YAML file.
- Internet access is necessary for proper operation, as it uses CDNs to download Swagger UI and js-yaml.
- The plugin uses DataviewJS to render an iframe or link. Please make sure that you have installed the Dataview plugin and enabled the JS script settings for it in your Obsidian instance.

### Installation
- Copy the plugin files to the `obsidian/plugins/openapi-renderer/` folder in your Obsidian repository.
- Enable the plugin in the Obsidian settings (Settings → Third-party plugins).

### Usage
- Open a note in the same directory as your OpenAPI YAML file.
- Press `Ctrl+Shift+O` (or `Cmd+Shift+O` on Mac) to generate HTML and insert the Dataview JS script.
- If all goes well, you should see the generated Swagger UI in your note.

### Settings
In the settings for the plugin, you can customize:
- The name of the generated HTML file.
- The dimensions (width and height) of the iframe.

### Credits 
Thank to [mnaoumov](https://github.com/mnaoumov/) for providing the dataviewjs script to render local files in an iframe.