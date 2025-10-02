import { ChartBar, File, Globe, Home } from 'lucide-react';
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    NavbarContainer,
    NavbarTab,
    NavbarTabs,
} from 'ui/views/OpenAPI Entry/components/navigation/navbar/styled/styled';

const Navbar: React.FC = () => {
    return (
        <NavbarContainer>
            <NavbarTabs>
                <NavbarTab as={NavLink} to={'/'}>
                    <Home /> Home
                </NavbarTab>
                <NavbarTab as={NavLink} to={'/browse'}>
                    <Globe /> Browse tracked files
                </NavbarTab>
                <NavbarTab as={NavLink} to={'/stat'}>
                    <ChartBar /> Stats
                </NavbarTab>
            </NavbarTabs>
        </NavbarContainer>
    );
};

export default Navbar;
