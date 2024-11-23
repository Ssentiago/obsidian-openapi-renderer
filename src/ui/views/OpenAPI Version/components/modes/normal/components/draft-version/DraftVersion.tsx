import { ExternalLink, Eye, Save } from 'lucide-react';
import React from 'react';
import { convertData, createNewLeaf } from 'ui/common/helpers';
import { OPENAPI_VIEW } from 'ui/typing/types';
import { useSpecificationContext } from 'ui/views/OpenAPI Version/components/core/context';
import { RestoredLabel } from 'ui/views/OpenAPI Version/components/modes/normal/components/draft-version/styled/draftVersionStyled';
import {
    ModalFormData,
    SaveCurrentVersionModal,
} from 'ui/views/OpenAPI Version/components/modes/normal/modals/save-current-version-modal/save-current-version-modal';
import { Card } from 'ui/views/OpenAPI Version/components/modes/normal/styled/normalStyled';
import {
    Button,
    ButtonGroup,
    Title,
} from 'ui/views/OpenAPI Version/components/modes/styled/common-styled';

const DraftVersion: React.FC<{
    updateSpecs: () => void;
}> = ({ updateSpecs }) => {
    const { restored, view, app, plugin, setCurrentSpec, setMode } =
        useSpecificationContext();

    const handleCurrentPreview = async (): Promise<void> => {
        const file = view.file;
        if (!file) {
            return;
        }
        const data = convertData(
            await view.app.vault.cachedRead(file),
            file.extension
        );

        setCurrentSpec(data);
        setMode('Preview');
    };

    const handleSaveCurrentVersion = async (): Promise<void> => {
        new SaveCurrentVersionModal(
            app,
            plugin,
            view.versions,
            async (data: ModalFormData) => {
                const saved =
                    await view.controller.versionController.saveVersion(data);
                if (saved) {
                    view.plugin.showNotice('Saved successfully');
                    updateSpecs();
                } else {
                    view.plugin.showNotice(
                        'Version was not saved. ' +
                            'Please check the logs for more info'
                    );
                }
            }
        ).open();
    };

    const handleOpenInOpenAPIView = async (): Promise<void> => {
        await createNewLeaf(OPENAPI_VIEW, view);
    };

    return (
        <Card>
            <Title>Draft version</Title>
            {restored && (
                <RestoredLabel>
                    Restored from version {restored.version}
                </RestoredLabel>
            )}
            <ButtonGroup>
                <Button aria-label={'Preview'} onClick={handleCurrentPreview}>
                    <Eye />
                    Preview
                </Button>
                <Button
                    aria-label={'Save current version'}
                    onClick={handleSaveCurrentVersion}
                >
                    <Save />
                    Save draft version
                </Button>
                <Button
                    aria-label={'Open in OpenAPI View'}
                    onClick={handleOpenInOpenAPIView}
                >
                    <ExternalLink />
                    Open in OpenAPI View
                </Button>
            </ButtonGroup>
        </Card>
    );
};

export default DraftVersion;
