import React from 'react';
import { App } from 'obsidian';
import OpenAPIRendererPlugin from 'core/openapi-renderer-plugin';
import { SettingProvider } from './core/context';
import SettingsPage from './settings-page/SettingsPage';

const Application: React.FC<{
    app: App;
    plugin: OpenAPIRendererPlugin;
}> = ({ app, plugin }) => (
    <SettingProvider app={app} plugin={plugin}>
        <SettingsPage />
    </SettingProvider>
);

export default Application;
