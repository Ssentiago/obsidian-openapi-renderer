import React from 'react';

import {
    ODropdown,
    OFolder,
    OSetting,
    OToggle,
} from '@obsidian-lib/native-react-components';
import { useSettingsContext } from 'settings/components/core/context';

/**
 * General OpenAPI View settings: file registration and default view mode.
 */
const General: React.FC = () => {
    const { plugin } = useSettingsContext();

    return (
        <>
            <OSetting
                name='Register YAML and JSON files for processing by default?'
                desc={[
                    'Enable this option to open YAML and JSON files in this view by default.',
                    'You can still open these files via the context menu.',
                    'Changes require restarting the plugin to take effect.',
                ]}
            >
                <OToggle
                    value={plugin.settings.registerYamlJson}
                    onChange={async (value) => {
                        plugin.settings.registerYamlJson = value;
                        await plugin.settingsManager.saveSettings();
                    }}
                />
            </OSetting>

            <OSetting
                name='Export folder'
                desc={[
                    'Folder for standalone HTML exports and ZIP archives.',
                    'Created automatically. Empty value writes to the vault root.',
                ]}
            >
                <OFolder
                    value={plugin.settings.exportFolder}
                    onChange={async (value) => {
                        plugin.settings.exportFolder = value;
                        await plugin.settingsManager.saveSettings();
                    }}
                    includeRoot
                    placeholder='exports'
                />
            </OSetting>

            <OSetting
                name={'Default mode'}
                desc={'Select the default mode for viewing specs'}
            >
                <ODropdown
                    value={plugin.settings.OpenAPIViewDefaultMode}
                    options={{
                        source: 'Source',
                        preview: 'Preview',
                    }}
                    onChange={async (value) => {
                        plugin.settings.OpenAPIViewDefaultMode = value;
                        await plugin.settingsManager.saveSettings();
                    }}
                />
            </OSetting>
        </>
    );
};

export default General;
