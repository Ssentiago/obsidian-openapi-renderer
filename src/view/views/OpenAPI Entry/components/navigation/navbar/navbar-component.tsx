import { File, Globe, Home } from 'lucide-react';
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    NavbarContainer,
    NavbarTab,
    NavbarTabs,
} from 'view/views/OpenAPI Entry/components/navigation/navbar/styled/styled';

const Navbar: React.FC = () => {
    return (
        <NavbarContainer>
            <NavbarTabs>
                <NavbarTab as={NavLink} to={'/'}>
                    <Home /> Home
                </NavbarTab>
                <NavbarTab as={NavLink} to={'/browse'}>
                    <Globe /> Browse
                </NavbarTab>
                {/*<NavbarTab as={NavLink} to={'/file'}>*/}
                {/*    <File /> FileManager*/}
                {/*</NavbarTab>*/}
            </NavbarTabs>
        </NavbarContainer>
    );
};

export default Navbar;
