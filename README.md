# OpenAPI Renderer Plugin for Obsidian

Integrate OpenAPI specification editing and rendering into Obsidian: write and
maintain Swagger UI documentation without switching between applications.

## Why? 
I once wrote documentation for my small project directly in Obsidian while working on the 
database. Later, I needed to work with API documentation, so I started looking for suitable 
solutions among Obsidian plugins. Not finding any good options, I decided to create a plugin 
that allows writing Swagger UI documentation directly in Obsidian, without the need to switch 
between different applications. I hope I’ve managed to create something useful. If you have any 
suggestions for improvement, feel free to leave any issues here!


## Key features

- Edit OpenAPI specifications in a CodeMirror editor with autocompletion, linting and formatting
- Render specifications in Swagger UI with external $ref resolution
- Convert files between YAML and JSON
- Export specifications as standalone offline HTML pages (single file or ZIP archive)

## Installation

1. Manual:
    1. Download the last release assets and copy them into your `.
    obsidian/plugins/openapi-renderer` 
       directory
       (create it if it doesn’t exist)
    2. Enable the plugin in Obsidian settings (Settings → Community plugins).
2. Via the Community plugins Browser:
    1. Go to `Settings` -> `Community plugins`, click on `Browse` button and search for 
       `OpenAPI Renderer`. Install it
    2. Enable the plugin in Obsidian settings (Settings → Community plugins).

## What this plugin can do?

**Note: You need to enable the `Detect all file extension` option in Settings -> Files and Links.**

The plugin has 3 main functions:
1. Edit specification files
2. Render them in Swagger UI
3. Export them as standalone HTML

Optionally the plugin can register all `.yaml`, `.yml` and `.json` files to open in
OpenAPI View by default. This is disabled by default so the configs of other plugins
stay untouched. You can enable it in plugin settings: OpenAPI View -> `Register YAML and
JSON for processing by default?`. Either way you can always open a specification via the
file context menu item `Open in OpenAPI View`.

### Edit and Preview

There are two ways to open the view for editing or previewing specifications:
1. Select a specification file in Explorer (works when `Register YAML and JSON for processing by default?` is enabled)
2. Right-click the file and select `Open in OpenAPI View`

Both methods will open the OpenAPI View, which has two modes:
- Source mode: A CodeMirror-based editor for file editing
- Preview mode: Renders specification in Swagger UI, with $ref resolution support (this functionality hasn't been widely tested)

How it looks:

- Source mode:  
  ![source](https://github.com/user-attachments/assets/d6e74610-6df6-49f6-8f4c-e28df1f92329)
- Preview mode:  
  ![preview](https://github.com/user-attachments/assets/526a9347-353c-4e6f-b004-eb9455f0da70)

Available actions in the top actions bar:

- View:
    - Change mode (source / preview)
    - Export the current file as standalone HTML
- Source mode:
    - Extensions (you can enable or disable some extensions for the source mode. This applies locally)
    - Format content
    - Convert between yaml / json
- Preview mode:
    - Mode indicator (shows current rendering mode: "fast" when view is linked with another 
      OpenAPI View and \$ref resolving is disabled, or "full" in non-linked mode with \$ref 
      resolving enabled)
    - Rerender the preview

Both modes also have a theme toggle (dark / light) with optional sync to the Obsidian theme.

### Export

The export produces a self-contained HTML page: Swagger UI styles and runtime are inlined,
so the page opens offline in any browser. By default exports are written to the `exports`
folder in the vault root; the folder is configurable in plugin settings and created on
demand.

Two export commands are available in the command palette:
- Export current OpenAPI as standalone HTML
- Export all OpenAPI files as ZIP

## Credits

Special thanks to [mnaoumov](https://github.com/mnaoumov/) for valuable insights and contributions, which greatly supported the development of this plugin.

## Reporting Issues

If you encounter any bugs or unexpected behavior, please [open an issue on GitHub](https://github.com/ssentiago/openapi-renderer/issues). If you want to offer a new feature, feel free to suggest.

Your involvement makes the plugin better for everyone.
