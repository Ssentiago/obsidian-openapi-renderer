import React from 'react';
import { useSettingsContext } from '../../core/context';
import {
    OButton,
    OSetting,
} from '@obsidian-lib/native-react-components';

/**
 * The About component renders settings options for visiting the GitHub page and
 * providing feedback for the plugin. It also displays the current version and license
 * information.
 *
 * @returns A React fragment containing settings buttons and version information.
 */
const About: React.FC = () => {
    const { plugin } = useSettingsContext();

    return (
        <>
            <OSetting name={'Visit GitHub page of this plugin'}>
                <OButton
                    icon={'github'}
                    tooltip={'Go to GitHub page of this plugin'}
                    onClick={() => {
                        open(
                            'https://github.com/Ssentiago/obsidian-openapi-renderer'
                        );
                    }}
                />
            </OSetting>
            <OSetting name={'Do you have any feedback?'}>
                <OButton
                    icon={'message-circle-question'}
                    tooltip={'Leave feedback'}
                    onClick={() => {
                        open(
                            'https://github.com/Ssentiago/obsidian-openapi-renderer/issues'
                        );
                    }}
                />
            </OSetting>

            <footer
                style={{
                    marginTop: '48px',
                    fontSize: 'small',
                    color: 'gray',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <div>Current version: {plugin.manifest.version}</div>
                <div>
                    •{' '}
                    <a
                        href="https://github.com/Ssentiago/obsidian-openapi-renderer/blob/main/LICENSE"
                        target="_blank"
                    >
                        Apache 2.0
                    </a>
                </div>
            </footer>
        </>
    );
};

export default About;
