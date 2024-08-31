import React from 'react';
import { FaBook, FaCog, FaEye } from 'react-icons/fa';

import { useSettingsContext } from '../core/context';
import {
    NavbarContainer,
    NavbarTab,
    NavbarTabs,
    TabIcon,
} from './navbar-styled-components';

const Navbar: React.FC = () => {
    const { currentTab, setCurrentTab } = useSettingsContext();

    const handleTabCluck = (tab: string): void => {
        setCurrentTab(tab);
    };

    return (
        <NavbarContainer>
            <NavbarTabs>
                <NavbarTab
                    className={currentTab === 'general' ? 'active' : ''}
                    onClick={() => handleTabCluck('general')}
                >
                    <TabIcon>
                        <FaCog />
                    </TabIcon>
                    General
                </NavbarTab>
                {/*<NavbarTab*/}
                {/*    className={currentTab === 'server' ? 'active' : ''}*/}
                {/*    onClick={() => handleTabCluck('server')}*/}
                {/*>*/}
                {/*    <TabIcon>*/}
                {/*        <FaServer />*/}
                {/*    </TabIcon>*/}
                {/*    Server*/}
                {/*</NavbarTab>*/}
                <NavbarTab
                    className={currentTab === 'openapi-view' ? 'active' : ''}
                    onClick={() => handleTabCluck('openapi-view')}
                >
                    <TabIcon>
                        <FaEye />
                    </TabIcon>
                    OpenAPI View
                </NavbarTab>
                {/*<NavbarTab*/}
                {/*    className={*/}
                {/*        currentTab === 'openapi-version-view' ? 'active' : ''*/}
                {/*    }*/}
                {/*    onClick={() => handleTabCluck('openapi-version-view')}*/}
                {/*>*/}
                {/*    <TabIcon>*/}
                {/*        <PiGitDiff />*/}
                {/*    </TabIcon>*/}
                {/*    OpenAPI Version View*/}
                {/*</NavbarTab>*/}
                <NavbarTab
                    className={
                        currentTab === 'openapi-entry-view' ? 'active' : ''
                    }
                    onClick={() => handleTabCluck('openapi-entry-view')}
                >
                    <TabIcon>
                        <FaBook />
                    </TabIcon>
                    OpenAPI Entry View
                </NavbarTab>
            </NavbarTabs>
        </NavbarContainer>
    );
};

export default Navbar;
