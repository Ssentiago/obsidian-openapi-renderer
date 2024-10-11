import React from 'react';
import { useSettingsContext } from '../core/context';
import GeneralSection from '../general-section/GeneralSection';
import Navbar from '../navbar/Navbar';
import OpenAPIEntrySection from '../openapi-entry-section/OpenAPIEntrySection';
import OpenAPIViewSection from '../openapi-view-section/OpenAPIViewSection';

/**
 * The main settings tab component for OpenAPI Renderer.
 *
 * This component renders the main settings page for OpenAPI Renderer, including
 * the navbar and the content of the currently selected tab.
 *
 * @returns A React element representing the main settings page.
 */
const SettingsTab: React.FC = (): React.ReactElement => {
    const { currentTab } = useSettingsContext();

    const renderContent = () => {
        switch (currentTab) {
            case 'general':
                return <GeneralSection />;
            case 'openapi-view':
                return <OpenAPIViewSection />;
            case 'openapi-entry-view':
                return <OpenAPIEntrySection />;
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
