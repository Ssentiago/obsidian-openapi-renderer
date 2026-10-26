import React from 'react';
import {
    OSetting,
    OToggle,
} from '@obsidian-lib/native-react-components';
import { useSettingsContext } from 'settings/components/core/context';
import { UserExtensions } from 'ui/views/OpenAPI/components/source/typing/interfaces';

/**
 * Source editor extensions toggles.
 */
const Extensions: React.FC = () => {
    const { plugin } = useSettingsContext();

    return (
        <>
            {Object.entries(plugin.settings.extensions).map(
                ([id, extension]) => (
                    <OSetting name={extension.name} key={id} noBorder>
                        <OToggle
                            value={extension.on}
                            onChange={async (value) => {
                                plugin.settings.extensions[
                                    id as UserExtensions
                                ].on = value;
                                await plugin.settingsManager.saveSettings();
                            }}
                        />
                    </OSetting>
                )
            )}
        </>
    );
};

export default Extensions;
