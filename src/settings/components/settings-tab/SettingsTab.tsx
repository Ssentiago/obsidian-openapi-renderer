import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { useSettingsContext } from 'settings/components/core/context';
import General from 'settings/components/pages/general/General';
import OpenAPIEntry from 'settings/components/pages/openapi-entry/OpenAPIEntry';
import Toolbar from 'settings/components/settings-tab/toolbar/Toolbar';
import OpenAPIView from 'settings/components/pages/openapi-view/OpenAPIView';

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
                <Route path="/general" element={<General />} />
                <Route path="/openapi-view" element={<OpenAPIView />} />
                <Route path="/openapi-entry-view" element={<OpenAPIEntry />} />
            </Routes>
        </MemoryRouter>
    );
};

export default SettingsTab;
