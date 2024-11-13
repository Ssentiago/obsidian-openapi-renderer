import React from 'react';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import { useSettingsContext } from 'settings/components/core/context';

const General: React.FC = () => {
    const { plugin } = useSettingsContext();
    return (
        <ReactObsidianSetting
            name="Download plugin's assets from Github release"
            addButtons={[
                (button): any => {
                    button.setIcon('github').onClick(async () => {
                        button.setIcon('loader');
                        await plugin.githubClient.downloadAssetsFromLatestRelease();
                        button.setIcon('github');
                    });
                    return button;
                },
            ]}
        />
    );
};

export default General;
