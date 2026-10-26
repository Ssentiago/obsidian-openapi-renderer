import React from 'react';
import { Notice } from 'obsidian';
import {
    OButton,
    OSetting,
} from '@obsidian-lib/native-react-components';
import { useSettingsContext } from '../../../core/context';
import { useLocation } from 'react-router-dom';

/**
 * A React component that renders a button to reset settings to their default values.
 *
 * This component uses `OSetting` with an `OButton` to reset the plugin settings,
 * reload the settings, and display a notice to the user.
 *
 * It also updates the current path in the settings context based on the current
 * location.
 *
 * @returns A React element for resetting settings.
 */
const ResetSettings: React.FC = () => {
    const { plugin, forceReload, setCurrentPath } = useSettingsContext();

    const location = useLocation();

    return (
        <OSetting>
            <OButton
                icon={'rotate-ccw'}
                tooltip={'Reset settings to default'}
                onClick={async () => {
                    setCurrentPath(location.pathname);
                    await plugin.settingsManager.resetSettings();
                    forceReload();
                    new Notice('Settings have been reset to default.');
                }}
            />
        </OSetting>
    );
};

export default ResetSettings;
