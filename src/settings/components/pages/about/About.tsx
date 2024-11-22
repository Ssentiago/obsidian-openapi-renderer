import React from 'react';
import { useSettingsContext } from '../../core/context';
import { ReactObsidianSetting } from 'react-obsidian-setting';

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
            <ReactObsidianSetting
                name={'Visit GitHub page of this plugin'}
                addButtons={[
                    (button) => {
                        button.setIcon('github');
                        button.setTooltip('Go to GitHub page of this plugin');
                        button.onClick((cb) => {
                            open(
                                'https://github.com/Ssentiago/obsidian-openapi-renderer'
                            );
                        });
                        return button;
                    },
                ]}
            />
            <ReactObsidianSetting
                name={'Do you have any feedback?'}
                addButtons={[
                    (button) => {
                        button.setIcon('message-circle-question');
                        button.setTooltip('Leave feedback');
                        button.onClick(() => {
                            open(
                                'https://github.com/Ssentiago/obsidian-openapi-renderer/issues'
                            );
                        });
                        return button;
                    },
                ]}
            />

            <footer
                style={{
                    position: 'absolute',
                    bottom: 10,
                    left: '50%',
                }}
            >
                <div
                    style={{
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
                </div>
            </footer>
        </>
    );
};

export default About;
