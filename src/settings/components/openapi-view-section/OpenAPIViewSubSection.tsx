import { App, Setting } from 'obsidian';
import React, { useEffect } from 'react';
import { useSettingsContext } from 'settings/components/core/context';

/**
 * A React component that renders the OpenAPI View settings sub-section.
 *
 * This component renders a settings dropdown for selecting the default mode for viewing OpenAPI View.
 *
 * @param {App} app - The Obsidian app instance.
 * @param {HTMLElement | null} containerEl - The container element for the settings sub-section.
 *
 * @returns {React.ReactElement | null} A React element or null if the container element is null.
 */
const OpenAPIViewSubSection: React.FC<{
    containerEl: HTMLElement | null;
}> = ({ containerEl }) => {
    const { plugin } = useSettingsContext();
    useEffect(() => {
        if (containerEl) {
            new Setting(containerEl)
                .setName('OpenAPI View default mode')
                .setDesc('Select default mode for viewing OpenAPI View')
                .addDropdown((dropdown) => {
                    dropdown.addOption('source', 'Source');
                    dropdown.addOption('preview', 'Preview');
                    dropdown
                        .setValue(plugin.settings.OpenAPIViewDefaultMode)
                        .onChange(async (value) => {
                            plugin.settings.OpenAPIViewDefaultMode = value;
                            await plugin.settingsManager.saveSettings();
                        });
                });
        }
    }, [containerEl]);

    return null;
};

export default OpenAPIViewSubSection;
