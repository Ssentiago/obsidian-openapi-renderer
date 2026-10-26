import { useSettingsContext } from 'settings/components/core/context';

import React, { useCallback } from 'react';

import { OButton } from '@obsidian-lib/native-react-components';

/**
 * Reset-to-defaults button. Rendered at the bottom of the root settings page.
 */
const ResetSettings: React.FC = () => {
    const { plugin, forceReload } = useSettingsContext();

    const resetAction = useCallback(async () => {
        await plugin.settingsManager.resetSettings();
        forceReload();
        plugin.showNotice('Settings have been reset to default.');
    }, [plugin, forceReload]);

    return (
        <OButton
            variant={'warning'}
            label={'Reset'}
            tooltip={'Reset settings to default'}
            onClick={() => void resetAction()}
        />
    );
};

export default ResetSettings;
