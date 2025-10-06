import { loading } from 'blessed';
import { EventID } from 'events-management/typing/constants';
import React, { useEffect, useState } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import styled from 'styled-components';
import { useEntryContext } from 'ui/views/OpenAPI Entry/components/core/context';
import Navbar from 'ui/views/OpenAPI Entry/components/navigation/navbar/Navbar';
import Browse from 'ui/views/OpenAPI Entry/components/pages/browse/Browse';
import Home from 'ui/views/OpenAPI Entry/components/pages/home/Home';

const FadeContainer = styled.div<{ loading: boolean }>`
    opacity: ${(props) => (props.loading ? 0 : 1)};
    transition: opacity 0.3s ease-in-out;
`;

const Navigation: React.FC = () => {
    const { setSpecData, view } = useEntryContext();

    useEffect(() => {
        const f = async () => {
            const newSpecsData = await view.controller.getEntryViewData();
            setSpecData(newSpecsData);
        };
        f();
    }, [view]);

    useEffect(() => {
        const ref = view.plugin.observer.subscribe(
            view.app.workspace,
            EventID.ReloadOpenAPIEntryState,
            async () => {
                const newSpecsData = await view.controller.getEntryViewData();
                setSpecData(newSpecsData);
            }
        );
        return () => {
            view.app.workspace.offref(ref);
        };
    }, [view]);

    return (
        <MemoryRouter initialEntries={['/']}>
            <Navbar />
            <Routes>
                <Route path={'/'} element={<Home />} />
                <Route path={'/browse'} element={<Browse />} />
                <Route path={'/stat'} element={<div></div>} />
            </Routes>
        </MemoryRouter>
    );
};

export default Navigation;
