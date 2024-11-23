import React from 'react';
import {
    NoFilesContainer,
    NoFilesMessage,
} from 'ui/views/OpenAPI Entry/components/pages/browse/components/no-tracked-files/styled/styled';

const NoTrackedFilesMessage: React.FC = () => (
    <NoFilesContainer>
        <NoFilesMessage>No tracked files found</NoFilesMessage>
    </NoFilesContainer>
);

export default NoTrackedFilesMessage;
