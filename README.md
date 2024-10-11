# OpenAPI Renderer Plugin for Obsidian

Integrate OpenAPI specification management into Obsidian with features for version control,
visualization, editing, and easy navigation of API specs.

## Key features

- Edit and view OpenAPI specifications using Swagger UI
- Manage specification versions: create, view, restore, and delete
- Access all tracked OpenAPI specifications in your vault

## Roadmap
- Enhance Version and Entry views
~~- Enhancing views with new features and improvements~~
~~- Adding support for $ref links~~

## Installation

1. Copy plugin files to `.obsidian/plugins/openapi-renderer/` in your Obsidian vault. Or just
   download it from Obsidian -> Community plugins.
2. Enable the plugin in Obsidian settings (Settings → Community plugins).

## How-to

### OpenAPI view

This view supports the following file extensions: yaml, json.
In this view, you can use two modes:

- **Source Mode**: An editor based on CodeMirror that allows you to edit the file.
- **Preview Mode**: Renders your specification in Swagger UI for visualization.

How to use it? Just open yaml / json file in your vault. Note that you need to enable `Detect
all file extension` option in Settings -> Files and Links.  
How it looks:

- **Source mode**:  
  ![source](https://github.com/user-attachments/assets/d6e74610-6df6-49f6-8f4c-e28df1f92329)
- **Preview mode**:  
  ![preview](https://github.com/user-attachments/assets/526a9347-353c-4e6f-b004-eb9455f0da70)

**Available actions**:

- **View**:
    - Change mode (source / preview)
    - Open OpenAPI Version view in new tab
- **Source mode**:
    - Format content
    - Convert between yaml / json
    - Change theme mode (dark / light)
- **Preview mode**:
    - Change theme mode (dark / light)

### OpenAPI Version view

This view allows you to manage different versions of your OpenAPI specifications. You can create new
versions, view existing ones, restore previous versions, and delete unnecessary ones, ensuring that
your API documentation remains up-to-date and version-controlled. Additionally, you can compare
versions side-by-side to see the differences between them
How to use it: Open the view from the sidebar or directly from the OpenAPI View to start managing
your spec versions.
How it looks:
![version](https://github.com/user-attachments/assets/523016f1-243d-4119-9f84-b3960c467c66)

**Available actions**:

- Export all versions as a Zip: Quickly export all saved versions of your specification as a single
  Zip file

### OpenAPI Entry view

This view provides an overview of all your tracked OpenAPI specifications from the vault in one
interface. For each specification, you can see the total version count and the date of the last
update, making it easy to keep track of your API documentation.

**From this view, you can:**

- **Open spec in OpenAPI View:** Directly view and edit your specification.
- **Open spec in Version View:** Manage versions, compare changes, and restore previous versions.
- **Export spec as a Zip file:** Save the current specification and all its versions as a Zip file
  for backup or sharing.
- **Restore last version:** Replace the current content in the vault with the latest saved version (
  creates the file if it does not exist).
- **Remove version from tracking:** Stop tracking the file versions, but the file itself remains in
  the vault.

**How to use it:** Open the Entry View from the ribbon menu on the left by pressing
the `Open OpenAPI Entry View` button, or press `Ctrl + P` to open the command palette and search
for `OpenAPI Entry`.

**How it looks:**
![entry](https://github.com/user-attachments/assets/64db46f5-b631-422e-a53b-597de37fb1e0)

**Available actions:**

- **Export all versions of all files as a Zip file:** Easily export all tracked specifications and
  their versions as a single Zip file.

## Configuration

Customize the plugin in the settings:

**General Section:**

- **Reset settings to default:** Restore all plugin settings to their original defaults.
- **Download plugin's assets from GitHub release:** Download the plugin assets directly from the
  GitHub release.
- **Resources autoupdate on plugin update:** Automatically update resources when the plugin is
  updated.

**OpenAPI View:**

- **Default view mode:** Set the default mode for viewing OpenAPI specifications (Source or
  Preview).
- **OpenAPI preview theme mode:** Choose the theme for the OpenAPI preview (Light, Dark).
- **Synchronize OpenAPI preview theme mode with Obsidian theme mode:** Sync the preview theme with
  the current Obsidian theme.
- **OpenAPI source theme mode:** Choose the theme for the OpenAPI source editor (Light, Dark).
- **Synchronize OpenAPI source theme mode with Obsidian theme mode:** Sync the source editor theme
  with the current Obsidian theme.
- **OpenAPI source light theme:** Customize the light theme for the OpenAPI source editor.
- **OpenAPI source dark theme:** Customize the dark theme for the OpenAPI source editor.

**OpenAPI Entry View:**

- **Grid columns:** Set the number of columns displayed in the OpenAPI Entry view grid

## Credits

Special thanks to [mnaoumov](https://github.com/mnaoumov/) for valuable insights and contributions, which greatly supported the development of this plugin.

## Reporting Issues

If you encounter any bugs or unexpected behavior, please [open an issue on GitHub](https://github.com/ssentiago/openapi-renderer/issues). If you want to offer a new feature, feel free to suggest.

Your involvement makes the plugin better for everyone.

