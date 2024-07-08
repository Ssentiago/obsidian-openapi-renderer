# 1.0.0 (Initial Release)

## Features:
- Render OpenAPI specifications within Obsidian notes
- Support for both YAML and JSON OpenAPI specification files
- Generate HTML with Swagger UI for visualizing API documentation
- Automatic insertion of DataviewJS script for rendering the OpenAPI spec
- Customizable HTML file name and OpenAPI spec file name
- Adjustable iframe dimensions (width and height)
- Auto-update feature for real-time preview updates
- Hotkey support (Mod+Shift+O) for quick rendering

## Settings:
- Configurable HTML output file name
- Configurable OpenAPI specification file name (supports .yaml, .yml, and .json)
- Adjustable iframe width and height
- Toggle for auto-update functionality

## User Interface:
- Added a settings tab for easy configuration
- Implemented a refresh button for manual updates in desktop environments

## Integration:
- Seamless integration with Obsidian's file system and workspace
- Compatible with both desktop and mobile versions of Obsidian

## Performance:
- Implemented a debounce mechanism for auto-updates to prevent excessive rerender

# 2.0.0
## Major Changes:
- Renamed main plugin class to OpenAPIRendererPlugin for better clarity
- Implemented a new modular architecture with separate handler classes for improved code 
  organization and maintainability

## New Features:
- Added a new command to refresh Swagger UI (Mod+Shift+L hotkey)
- Implemented automatic iframe source updating when opening files
Added validation for HTML file existence on file open

## Improvements:
- Enhanced settings management with separate SettingsHandler class
- Improved error handling and user notifications
- Implemented more robust event handling system
- Added support for different view modes (source/preview) when updating iframes

## User Interface:
- Updated settings tab with improved input validation for file names and iframe dimensions
- Added notices for invalid inputs in settings with automatic reversion

## Performance:
- Optimized file open event handling with a small delay for better performance

# 3.0.0
- Working with local iframes via local server