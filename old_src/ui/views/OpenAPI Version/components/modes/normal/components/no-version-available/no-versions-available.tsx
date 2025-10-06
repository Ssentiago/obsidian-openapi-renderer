import { h } from 'preact';
import React from 'react';
import {
    MessageContainer,
    MessageSubtitle,
    MessageTitle,
} from 'ui/views/OpenAPI Version/components/modes/normal/components/no-version-available/style/styled';

const NoVersionsMessage: React.FC = () => (
    <MessageContainer>
        <MessageTitle>No versions available</MessageTitle>
        <MessageSubtitle>Save something to see versions here.</MessageSubtitle>
    </MessageContainer>
);

export default NoVersionsMessage;
