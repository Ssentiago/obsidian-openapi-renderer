import React from 'react';
import {
    BrowseButton,
    HomeButton,
    NavbarContainer,
} from './navbar-styled-components';
import { FaFolderOpen, FaHome } from 'react-icons/fa';
import { useEntryContext } from '../core/context';

const Navbar: React.FC = () => {
    const { currentPage, setCurrentPage } = useEntryContext();

    const handleNavigation = (page: 'entry' | 'browse'): void => {
        setCurrentPage(page);
    };

    return (
        <NavbarContainer>
            <HomeButton
                className={currentPage === 'entry' ? 'active' : ''}
                onClick={() => handleNavigation('entry')}
            >
                <FaHome /> Home
            </HomeButton>
            <BrowseButton
                className={currentPage === 'browse' ? 'active' : ''}
                onClick={() => handleNavigation('browse')}
            >
                <FaFolderOpen /> Browse Existing Specs
            </BrowseButton>
        </NavbarContainer>
    );
};

export default Navbar;
