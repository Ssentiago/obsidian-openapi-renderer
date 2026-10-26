import About from 'settings/components/pages/about/About';
import Extensions from 'settings/components/pages/openapi-view/Extensions';
import General from 'settings/components/pages/openapi-view/General';
import Preview from 'settings/components/pages/openapi-view/Preview';
import Source from 'settings/components/pages/openapi-view/Source';
import { useSettingsContext } from 'settings/components/core/context';

import React from 'react';

import {
    OSetting,
    OSettingDrillDown,
    OSettingGroup,
    SettingRoot,
} from '@obsidian-lib/native-react-components';

import ResetSettings from './ResetSettings';

/**
 * Root settings page.
 *
 * Structure mirrors the future plugin scope: everything about rendering
 * OpenAPI specs (OpenAPI View) plus plugin meta (About). OpenAPI Entry has
 * no place here — that feature is being removed.
 */
const SettingsPage: React.FC = () => {
    const { plugin, reloadCount } = useSettingsContext();

    const enabledExtensions = Object.values(plugin.settings.extensions).filter(
        (extension) => extension.on
    ).length;
    const totalExtensions = Object.keys(plugin.settings.extensions).length;

    return (
        <SettingRoot key={reloadCount}>
            <OSettingGroup>
                <OSettingDrillDown
                    name={'General'}
                    desc={
                        'File registration and the default OpenAPI View mode'
                    }
                >
                    <General />
                </OSettingDrillDown>

                <OSettingDrillDown
                    name={'Preview'}
                    desc={'Swagger UI preview theme'}
                    displayValue={plugin.settings.OpenAPIPreviewTheme}
                >
                    <Preview />
                </OSettingDrillDown>

                <OSettingDrillDown
                    name={'Source'}
                    desc={'Source editor theme'}
                    displayValue={plugin.settings.OpenAPISourceThemeMode}
                >
                    <Source />
                </OSettingDrillDown>

                <OSettingDrillDown
                    name={'Extensions'}
                    desc={'Source editor extensions'}
                    displayValue={`${enabledExtensions} / ${totalExtensions}`}
                >
                    <Extensions />
                </OSettingDrillDown>
            </OSettingGroup>

            <OSettingGroup heading={'Plugin'}>
                <OSettingDrillDown
                    name={'About'}
                    desc={'Links, version and license'}
                >
                    <About />
                </OSettingDrillDown>
            </OSettingGroup>

            <OSettingGroup heading={'Maintenance'}>
                <OSetting
                    name={'Reset settings'}
                    desc={'Restore all settings to their defaults'}
                >
                    <ResetSettings />
                </OSetting>
            </OSettingGroup>
        </SettingRoot>
    );
};

export default SettingsPage;
