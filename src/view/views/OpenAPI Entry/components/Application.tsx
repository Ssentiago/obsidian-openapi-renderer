import OpenAPIRendererPlugin from 'core/openapi-renderer-plugin';
import { App } from 'obsidian';
import React from 'react';
import { EntryProvider } from 'view/views/OpenAPI Entry/components/core/context';
import Navigation from 'view/views/OpenAPI Entry/components/navigation/Navigation';
import { EntryView } from 'view/views/OpenAPI Entry/entry-view';

const Application: React.FC<{
    view: EntryView;
    app: App;
    plugin: OpenAPIRendererPlugin;
}> = ({ view, app, plugin }) => (
    <EntryProvider view={view} app={app} plugin={plugin}>
        <Navigation />
    </EntryProvider>
);

export default Application;
