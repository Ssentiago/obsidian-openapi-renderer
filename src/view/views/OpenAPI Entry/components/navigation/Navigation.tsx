import { EventID } from 'events-management/typing/constants';
import React, { useEffect } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { useEntryContext } from 'view/views/OpenAPI Entry/components/core/context';
import Navbar from 'view/views/OpenAPI Entry/components/navigation/navbar/navbar-component';
import Browse from 'view/views/OpenAPI Entry/components/pages/browse/Browse';
import Home from 'view/views/OpenAPI Entry/components/pages/home/Home';

const Navigation: React.FC = () => {
    const { setSpecData, view } = useEntryContext();

    useEffect(() => {
        view.controller
            .getEntryViewData()
            .then(setSpecData)
            .catch((err) => err);
    }, [view]);

    useEffect(() => {
        view.plugin.observer.subscribe(
            view.app.workspace,
            EventID.ReloadOpenAPIEntryState,
            async () => {
                const newSpecsData = await view.controller.getEntryViewData();
                setSpecData(newSpecsData);
            }
        );
    }, [view]);

    return (
        <MemoryRouter initialEntries={['/']}>
            <Navbar />
            <Routes>
                <Route path={'/'} element={<Home />} />
                <Route path={'/browse'} element={<Browse />} />
                {/*<Route path={'/file'} element={<FileDialogComponent />} />*/}
            </Routes>
        </MemoryRouter>
    );
};

export default Navigation;
