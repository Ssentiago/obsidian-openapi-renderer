# OpenAPI Renderer Plugin for Obsidian

This plugin generates a Swagger-UI interface and embeds it as an iframe in the current view of an Obsidian note.

## Features

- Renders OpenAPI specifications as interactive Swagger UI
- Supports both YAML and JSON formats
- Embedded lightweight Express server for local file serving
- Customizable settings
- Automatic and manual update options

## Installation

1. Copy plugin files to `.obsidian/plugins/openapi-renderer/` in your Obsidian vault.
2. Enable the plugin in Obsidian settings (Settings → Community plugins).

## Usage

1. Open a note in the same directory as your OpenAPI YAML/JSON file.
2. Ensure you enabled the local server
3. Use the command palette to inline rendering or set key for it
4. The Swagger UI should appear in your note in preview mode.

## Configuration

Customize the plugin in the settings:

### General settings
 
- Reset setting to default
- Download plugin resources from release
- Auto-download plugin resources on update
- Default export option

### UI

- Enable start server button
- Server button locations
- Enable commands buttons (render and refresh)
- Render button locations 
- Refresh button locations 

### Render

- OpenAPI spec filename 
- Dimensions for iframe (width and height)
- Enable autoupdate on file change
- Timeout of autoupdate

### Server 

- Button for check server status and toggle it
- Autostart server on plugin start
- Server listening port


## Commands

- Render OpenAPI Swagger UI inline
- Refresh OpenAPI Swagger UI preview

## Known Issues

- When using the "VSCode Editor" plugin to edit YAML/JSON specification files, there may be issues with automatic updates. Use manual update or edit specifications in an external tool.
- Buttons may be buggy. If you noticed this, please, create an issue

## Demonstration

A bit old, but still relevant.

![OpenAPI Renderer Demo](https://github.com/Ssentiago/openapi-renderer/assets/76674116/25cfc3b8-347b-4c0a-acfe-0c5bf3849d14)

## Credits

Special thanks to [mnaoumov](https://github.com/mnaoumov/) for valuable insights and contributions, which greatly supported the development of this plugin.

## Important Notes

- The plugin searches for YAML or JSON files in the current folder of the opened note.
- Ensure that the specification filename matches your plugin settings.

## Third-Party Resources

This project uses the following third-party resources:

- [Swagger UI](https://github.com/swagger-api/swagger-ui) - Licensed under the [Apache License 2.
  0](./src/assets/swagger-ui/LICENSE).