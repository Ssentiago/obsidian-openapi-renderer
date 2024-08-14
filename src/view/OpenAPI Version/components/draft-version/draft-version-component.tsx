import React from 'react';
import {
    ButtonGroup,
    Card,
    OpenInOpenAPIButton,
    PreviewButton,
    RestoreButton,
    SaveButton,
    Title,
} from '../styled/styled-components';
import {
    FaCalendarAlt,
    FaExternalLinkAlt,
    FaEye,
    FaSave,
} from 'react-icons/fa';
import styled from 'styled-components';

const CurrentVersionContainer = styled.div`
    margin-bottom: 30px;
`;

const DraftVersionComponent: React.FC<{
    onPreview: () => void;
    onSave: () => Promise<void>;
    onSaveSuccess: () => void;
    onRestoreTo: () => void;
    onOpenInOpenAPIView: () => void;
}> = ({
    onPreview,
    onSave,
    onSaveSuccess,
    onRestoreTo,
    onOpenInOpenAPIView,
}) => {
    const handleSave = async (): Promise<void> => {
        await onSave();
        onSaveSuccess();
    };

    return (
        <CurrentVersionContainer>
            <Card $isCurrent={true}>
                <Title>Draft version</Title>
                <ButtonGroup>
                    <PreviewButton onClick={onPreview}>
                        <FaEye style={{ color: 'var(--icon-color)' }} />
                        Preview
                    </PreviewButton>
                    <SaveButton onClick={handleSave}>
                        <FaSave style={{ color: 'var(--icon-color)' }} />
                        Save draft version
                    </SaveButton>
                    <RestoreButton onClick={onRestoreTo}>
                        <FaCalendarAlt style={{ color: 'var(--icon-color)' }} />
                        Restore to...
                    </RestoreButton>
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
