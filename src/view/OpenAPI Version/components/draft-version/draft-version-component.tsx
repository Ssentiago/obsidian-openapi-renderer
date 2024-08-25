import React from 'react';
import { FaExternalLinkAlt, FaEye, FaSave } from 'react-icons/fa';
import styled from 'styled-components';
import { useSpecificationContext } from '../core/context';
import {
    ButtonGroup,
    Card,
    OpenInOpenAPIButton,
    PreviewButton,
    SaveButton,
    Title,
} from '../styled/styled-components';

const CurrentVersionContainer = styled.div`
    margin-bottom: 30px;
`;

const RestoredLabel = styled.div`
    background-color: var(--color-base-25);
    color: var(--color-blue);
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: bold;
    display: inline-block;
    box-shadow: 0px 2px 4px rgba(var(--mono-rgb-100), 0.1);
    margin-top: 16px;
`;

const DraftVersionComponent: React.FC<{
    onPreview: () => void;
    onSave: () => Promise<void>;
    onSaveSuccess: () => void;
    onOpenInOpenAPIView: () => void;
}> = ({ onPreview, onSave, onSaveSuccess, onOpenInOpenAPIView }) => {
    const handleSave = async (): Promise<void> => {
        await onSave();
        onSaveSuccess();
    };
    const { restored } = useSpecificationContext();

    return (
        <CurrentVersionContainer>
            <Card $isCurrent={true}>
                <Title>Draft version</Title>
                {restored && (
                    <RestoredLabel>
                        Restored from version {restored.version}
                    </RestoredLabel>
                )}
                <ButtonGroup>
                    <PreviewButton onClick={onPreview}>
                        <FaEye style={{ color: 'var(--icon-color)' }} />
                        Preview
                    </PreviewButton>
                    <SaveButton onClick={handleSave}>
                        <FaSave style={{ color: 'var(--icon-color)' }} />
                        Save draft version
                    </SaveButton>
                    <OpenInOpenAPIButton onClick={onOpenInOpenAPIView}>
                        <FaExternalLinkAlt
                            style={{ color: 'var(--icon-color)' }}
                        />
                        Open in OpenAPI View
                    </OpenInOpenAPIButton>
                </ButtonGroup>
            </Card>
        </CurrentVersionContainer>
    );
};

export default DraftVersionComponent;
