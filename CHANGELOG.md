# 4.0.0

### Breaking Changes

- **Removed server functionality from the plugin:** The plugin no longer includes built-in server
  capabilities. If your workflow relied on this feature, consider using external server options or
  alternative methods.
- **Removed deprecated markdown codeblock swagger-ui rendering:** The support for rendering Swagger
  UI directly from markdown codeblocks has been discontinued. Please update your documentation and
  workflows accordingly.

### Features

- **Add new Obsidian OpenAPI View** for managing YAML and JSON files (they are considered OpenAPI
  specifications by the plugin - be careful)  
  **Features:**
    - **Source and Preview Modes**
    - **Source:**
        - Supports YAML and JSON files for editing
        - Includes extensions: linter, formatter, YAML/JSON converter, keyword completion
        - Light and dark theme modes. Two themes for each mode: default and VS Code
        - Action buttons for formatting content and converting between JSON/YAML
    - **Preview:**
        - Renders specification to Swagger UI
        - Light and dark theme modes
    - Action to open Version view in a new tab
    - **Action to change modes:**
        - Click to change mode
        - Ctrl + Click to open OpenAPI view to the right split and link it with the source view
        - Alt + Click to open a new OpenAPI View in a floating window and link it with the source
          view
        - Linked views synchronize content between all instances and synchronize scrolling between
          views in source mode

- **Add new Obsidian OpenAPI Version View** for managing versioning-related stuff linked with
  OpenAPI specifications.  
  **Features:**
    - Show the current file content as a Draft version card. You can open a preview of the current
      file version, save the draft version (triggers modal windows), and open it in a new OpenAPI
      view
    - Group all saved specifications by creation date, using relative dates (e.g., today, yesterday,
      N days ago)
    - **Actions for each specification card:**
        - **Preview:** Renders Swagger UI instantly
        - **Restore to...:** Restore the current file (draft) version to the specified version
        - **Diff:** Select versions for diff viewing (requires selecting two versions)
        - **Delete:** Soft delete version  
          For softly deleted version cards:  
          - Restore  
          - Delete permanently
        - **Export:** Export specified version as an HTML file with embedded CDN links to related
          resources (CSS and JS)
    - **View Actions:**
        - **Export all versions:** Export all versions of a file as a Zip file

- **Add new Obsidian OpenAPI Entry View**  
  **Features:**
    - Show all the trackable files in the vault in one grid interface as cards
    - **For each card:**
        - Show details: version count, last update
        - **Actions:**
            - **Open in OpenAPI View:** Opens the last draft version (i.e., opens OpenAPI view with
              the specified file path)
            - **Open in Version View**
            - **Export:** Similar to the OpenAPI Version view export action, exporting all the file
              versions
            - **Restore last file version:** Resets the file in the vault to the last saved version.
              If it’s deleted, it will be created
            - **Remove file from tracking** (the file remains in the vault)
        - **View Actions:**
            - **Export all versions of all tracked files:** Export as a Zip file

# 3.1.0

### Added

- **Export Options for Swagger-UI**:
  - **CDN Export**: Export with CDN links.
  - **Single-File Export**: Combine all code into one HTML file.
  - **ZIP Export**: Package the HTML file and its dependencies into a ZIP archive.
- **Custom Plugin Resource Downloader**: Implemented a new system for downloading plugin resources from GitHub Releases.
- The plugin now performs the following checks:
  - On first open: Notifies the user that an update is recommended.
  - If an update has been detected:
    - If auto-update is enabled: Automatically downloads the necessary resources.
    - If auto-update is not enabled: Prompts the user to manually download the resources.

### Improved

- **Refactored Generation Method**: Now using template-based generation for improved flexibility and maintainability.
- **Updated Plugin Settings UI**: Redesigned the plugin settings interface to include a navigation bar.

### Removed

- **Rendering Command in Modal Window**: Removed the command to render swagger ui within a 
  modal window.
- **HTML Filename Option in Settings**: Removed the HTML filename option from settings. We now 
  work exclusively with templates, and users can export their own Swagger UI manually (`Open 
  comand palette - OpenAPI Renderer: Export`).

# 3.0.0

### Added

- Implemented a custom event system with centralized handling (subscription and publication)
- Added an error logging system to file with rotation upon reaching maximum file size
- Implemented processing of custom HTML files through rendering in markdown codeblock
- Created a Swagger UI Modal class for displaying iframes in a modal window
- Introduced a lightweight express server for reading and rendering local HTML files
- Added the ability to open iframes in a modal window using hotkeys (experimental feature)

### Changed

- Completely restructured the project:

  - Divided into logical blocks: pluginEvents, pluginLogging, rendering, server, settings, 
    typing, UI 
  - The main src directory now contains main (entry point) and contextManager (shared resources)


- Improved the role of the eventsHandler class: now centralizes all event handlers
- Optimized the OpenAPI Renderer class: focus on creating HTML files and reading specifications
- Restructured the PreviewHandler class: now only responsible for updating previews

### Improved

- Completely revamped plugin settings:

  - Divided into three sections: server settings, rendering settings, and UI settings 
  - Added the ability to reset settings to default values 
  - Enhanced server settings:
    - Status check and state management 
    - Automatic start on plugin launch 
    - Port configuration with automatic search for available ports 
  - Improved rendering settings:
    - Configuration of expected file names (HTML and OpenAPI specification)
    - iframe size settings with preview 
    - Auto-update when specification file changes 
  - Flexible UI settings:
    - Added server button and command buttons (rendering inline and refresh preview) to the UI
    - Control visibility and location of buttons (server, rendering, update)
    - Implemented a flexible button management system using the "Observer" pattern

### New Commands

- Rendering in a modal window

# 2.0.0

### Major Changes:

- Renamed main plugin class to OpenAPIRendererPlugin for better clarity
- Implemented a new modular architecture with separate handler classes for improved code 
  organization and maintainability

### New Features:

- Added a new command to refresh Swagger UI (Mod+Shift+L hotkey)
- Implemented automatic iframe source updating when opening files
Added validation for HTML file existence on file open

### Improvements:

- Enhanced settings management with separate SettingsHandler class
- Improved error handling and user notifications
- Implemented more robust event handling system
- Added support for different view modes (source/preview) when updating iframes

### User Interface:

- Updated settings tab with improved input validation for file names and iframe dimensions
- Added notices for invalid inputs in settings with automatic reversion

## Performance:

- Optimized file open event handling with a small delay for better performance

# 1.0.0 (Initial Release)

### Features:
- Render OpenAPI specifications within Obsidian notes
- Support for both YAML and JSON OpenAPI specification files
- Generate HTML with Swagger UI for visualizing API documentation
- Automatic insertion of DataviewJS script for rendering the OpenAPI spec
- Customizable HTML file name and OpenAPI spec file name
- Adjustable iframe dimensions (width and height)
- Auto-update feature for real-time preview updates
- Hotkey support (Mod+Shift+O) for quick rendering

### Settings:
- Configurable HTML output file name
- Configurable OpenAPI specification file name (supports .yaml, .yml, and .json)
- Adjustable iframe width and height
- Toggle for auto-update functionality

### User Interface:
- Added a settings tab for easy configuration
- Implemented a refresh button for manual updates in desktop environments

### Integration:
- Seamless integration with Obsidian's file system and workspace
- Compatible with both desktop and mobile versions of Obsidian

### Performance:
- Implemented a debounce mechanism for auto-updates to prevent excessive rerender





