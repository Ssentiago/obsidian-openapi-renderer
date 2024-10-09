import React from 'react';
import { App } from 'obsidian';
import OpenAPIRendererPlugin from 'core/openapi-renderer-plugin';
import { SettingProvider } from './core/context';
import SettingsTab from './settings-tab/SettingsTab';

const Application: React.FC<{
    app: App;
    plugin: OpenAPIRendererPlugin;
}> = ({ app, plugin }) => (
    <SettingProvider app={app} plugin={plugin}>
        <SettingsTab />
    </SettingProvider>
);

export default Application;
