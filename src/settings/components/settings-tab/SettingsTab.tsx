import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { useSettingsContext } from 'settings/components/core/context';
import About from 'settings/components/pages/about/About';
import OpenAPIView from 'settings/components/pages/openapi-view/OpenAPIView';
import Toolbar from 'settings/components/settings-tab/toolbar/Toolbar';

/**
 * The main settings tab component for OpenAPI Renderer.
 *
 * This component renders the main settings page for OpenAPI Renderer, including
 * the navbar and the content of the currently selected tab.
 *
 * @returns A React element representing the main settings page.
 */
const SettingsTab: React.FC = (): React.ReactElement => {
    const { reloadCount, currentPath } = useSettingsContext();

    return (
        <MemoryRouter initialEntries={[currentPath]} key={reloadCount}>
            <Toolbar />
            <Routes>
                <Route path="/openapi-view" element={<OpenAPIView />} />
                <Route path={'/about'} element={<About />} />
                {/*<Route path="/openapi-entry-view" element={<OpenAPIEntry />} />*/}
            </Routes>
        </MemoryRouter>
    );
};

export default SettingsTab;
