import OpenAPIRendererPlugin from 'core/openapi-renderer-plugin';
import { Specification } from 'indexedDB/database/specification';
import { App } from 'obsidian';
import React from 'react';
import { SpecificationProvider } from 'ui/views/OpenAPI Version/components/core/context';
import { VersionView } from 'ui/views/OpenAPI Version/version-view';
import Main from './modes/Main';

export const Application: React.FC<{
    specifications: Specification[];
    view: VersionView;
    app: App;
    plugin: OpenAPIRendererPlugin;
}> = ({ specifications, view, app, plugin }) => (
    <SpecificationProvider app={app} plugin={plugin} view={view}>
        <Main view={view} specifications={specifications} />
    </SpecificationProvider>
);
