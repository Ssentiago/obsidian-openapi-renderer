import { App } from 'obsidian';
import React from 'react';
import OpenAPIRendererPlugin from '../../../core/OpenAPIRendererPlugin';
import { useSettingsContext } from '../core/context';
import GeneralSectionComponent from '../general-section-component/general-section-component';
import Navbar from '../navbar/navbar-component';
import OpenAPIEntrySectionComponent from '../openapi-entry-section-component/openapi-entry-section-component';
import OpenapiViewMainSectionComponent from '../openapi-view-section-component/openapi-view-main-section-component';

const SettingsTab: React.FC<{
    app: App;
    plugin: OpenAPIRendererPlugin;
}> = ({ app, plugin }) => {
    const { currentTab } = useSettingsContext();

    const renderContent = () => {
        switch (currentTab) {
            case 'general':
                return <GeneralSectionComponent app={app} plugin={plugin} />;
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
