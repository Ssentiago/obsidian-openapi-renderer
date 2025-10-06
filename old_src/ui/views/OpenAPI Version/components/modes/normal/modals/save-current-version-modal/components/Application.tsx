import OpenAPIRendererPlugin from 'core/openapi-renderer-plugin';
import { Specification } from 'indexedDB/database/specification';
import { App } from 'obsidian';
import React, { useRef, useState } from 'react';
import { ReactObsidianSetting } from 'react-obsidian-setting';
import { useSpecificationContext } from 'ui/views/OpenAPI Version/components/core/context';
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
    const versionName = useRef<string>('');
    const versionNumber = useRef<string>('');

    const handleSave = () => {
        if (!versionName.current.trim() || !versionNumber.current.trim()) {
            plugin.showNotice('Please fill out all required fields');
            return;
        }

        if (versionName.current.match(/\./) !== null) {
            plugin.showNotice('Version name cannot contain "."');
            return;
        }

        if (!versionNumber.current.match(/\d+\.\d+\.\d+/g)) {
            plugin.showNotice(
                "'Version should follow the Semantic Versioning format (MAJOR.MINOR.PATCH). Example: 1.0.0"
            );
            return;
        }
        const lastVersion = versions.length > 0 ? versions.at(-1) : undefined;
        if (!lastVersion) {
            onSubmit({
                specName: versionName.current,
                specVersion: versionNumber.current,
            });
            modal.close();
            return;
        }
        const isLastVersionGreater = isValidVersion(
            versionNumber.current,
            lastVersion.version
        );
        if (isLastVersionGreater) {
            onSubmit({
                specName: versionName.current,
                specVersion: versionNumber.current,
            });
            modal.close();
            return;
        }
        plugin.showNotice(
            'Please enter a version number greater than the last version.'
        );
    };

    return (
        <>
            <ReactObsidianSetting name={'Required Fields'} setHeading={true} />

            <ReactObsidianSetting
                name={'Version Name'}
                desc={
                    'Please provide a name for the new version of your specification.'
                }
                class={'required-field'}
                addTexts={[
                    (input) => {
                        input.onChange((value) => {
                            versionName.current = value;
                        });
                        return input;
                    },
                ]}
            />
            <ReactObsidianSetting
                name={'Version Number'}
                desc={'Enter a version number for this specification.'}
                class={'required-field'}
                noBorder={true}
                addTexts={[
                    (input) => {
                        input.onChange((value) => {
                            versionNumber.current = value;
                        });
                        return input;
                    },
                ]}
            />

            <ReactObsidianSetting
                addButtons={[
                    (button) => {
                        button.setIcon('save');
                        button.setTooltip('Save and exit');
                        button.onClick(handleSave);
                        return button;
                    },
                ]}
            />
        </>
    );
};

export default Application;
