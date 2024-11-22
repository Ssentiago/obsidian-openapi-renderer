import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    NavbarContainer,
    NavbarTab,
    NavbarTabs,
} from 'settings/components/settings-tab/toolbar/navbar/styled';

const Navbar: React.FC = () => (
    <NavbarContainer>
        <NavbarTabs>
            <NavbarTab as={NavLink} to="/openapi-view">
                OpenAPI View
            </NavbarTab>
            <NavbarTab as={NavLink} to={'/about'}>
                About
            </NavbarTab>
            {/*<NavbarTab as={NavLink} to="/openapi-entry-view">*/}
            {/*    OpenAPI Entry View*/}
            {/*</NavbarTab>*/}
        </NavbarTabs>
    </NavbarContainer>
);

export default Navbar;
