import React from 'react';
import { useSettingsContext } from '../core/context';
import GeneralSectionComponent from '../general-section-component/general-section-component';
import OpenAPIRendererPlugin from '../../../core/OpenAPIRendererPlugin';
import { App } from 'obsidian';
import Navbar from '../navbar/navbar-component';
import ServerSectionComponent from '../server-section-component/server-section-component';
import OpenapiViewMainSectionComponent from '../openapi-view-section-component/openapi-view-main-section-component';
import OpenAPIEntrySectionComponent from '../openapi-entry-section-component/openapi-entry-section-component';

const SettingsTab: React.FC<{
    app: App;
    plugin: OpenAPIRendererPlugin;
}> = ({ app, plugin }) => {
    const { currentTab } = useSettingsContext();

    const renderContent = () => {
        switch (currentTab) {
            case 'general':
                return <GeneralSectionComponent app={app} plugin={plugin} />;
            case 'server':
                return <ServerSectionComponent app={app} plugin={plugin} />;
            case 'openapi-view':
                return (
                    <OpenapiViewMainSectionComponent
                        app={app}
                        plugin={plugin}
                    />
                );
            case 'openapi-entry-view':
                return (
                    <OpenAPIEntrySectionComponent app={app} plugin={plugin} />
                );
        }
    };

    return (
        <>
            <Navbar />
            {renderContent()}
        </>
    );
};

export default SettingsTab;
