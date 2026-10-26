import OpenAPIRendererPlugin from 'core/openapi-renderer-plugin';
import { Specification } from 'indexedDB/database/specification';
import { App } from 'obsidian';
import React, { useState } from 'react';
import {
    OButton,
    OSetting,
    OText,
    SettingRoot,
} from '@obsidian-lib/native-react-components';
import { isValidVersion } from 'ui/views/OpenAPI Version/components/modes/normal/modals/save-current-version-modal/components/utils/isValidVersion';
import {
    ModalFormData,
    SaveCurrentVersionModal,
} from 'ui/views/OpenAPI Version/components/modes/normal/modals/save-current-version-modal/save-current-version-modal';

const Application: React.FC<{
    app: App;
    plugin: OpenAPIRendererPlugin;
    modal: SaveCurrentVersionModal;
    onSubmit: (data: ModalFormData) => void;
    versions: Specification[];
}> = ({ app, plugin, modal, onSubmit, versions }) => {
    const [versionName, setVersionName] = useState('');
    const [versionNumber, setVersionNumber] = useState('');

    const handleSave = () => {
        if (!versionName.trim() || !versionNumber.trim()) {
            plugin.showNotice('Please fill out all required fields');
            return;
        }

        if (versionName.match(/\./) !== null) {
            plugin.showNotice('Version name cannot contain "."');
            return;
        }

        if (!versionNumber.match(/\d+\.\d+\.\d+/g)) {
            plugin.showNotice(
                "'Version should follow the Semantic Versioning format (MAJOR.MINOR.PATCH). Example: 1.0.0"
            );
            return;
        }
        const lastVersion = versions.length > 0 ? versions.at(-1) : undefined;
        if (!lastVersion) {
            onSubmit({
                specName: versionName,
                specVersion: versionNumber,
            });
            modal.close();
            return;
        }
        const isLastVersionGreater = isValidVersion(
            versionNumber,
            lastVersion.version
        );
        if (isLastVersionGreater) {
            onSubmit({
                specName: versionName,
                specVersion: versionNumber,
            });
            modal.close();
            return;
        }
        plugin.showNotice(
            'Please enter a version number greater than the last version.'
        );
    };

    return (
        <SettingRoot>
            <OSetting name={'Required Fields'} heading={true} />

            <OSetting
                name={'Version Name'}
                desc={
                    'Please provide a name for the new version of your specification.'
                }
                className={'required-field'}
            >
                <OText
                    value={versionName}
                    onChange={(value) => {
                        setVersionName(value);
                    }}
                />
            </OSetting>
            <OSetting
                name={'Version Number'}
                desc={'Enter a version number for this specification.'}
                className={'required-field'}
                noBorder={true}
            >
                <OText
                    value={versionNumber}
                    onChange={(value) => {
                        setVersionNumber(value);
                    }}
                />
            </OSetting>

            <OSetting>
                <OButton
                    icon={'save'}
                    tooltip={'Save and exit'}
                    onClick={handleSave}
                />
            </OSetting>
        </SettingRoot>
    );
};

export default Application;
