import React from 'react';
import styled from 'styled-components';

const NoFilesContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    background-color: var(--color-base-10); /* Цвет фона */
    border: 1px solid var(--background-modifier-border); /* Цвет границы */
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    text-align: center;
`;

const NoFilesMessage = styled.p`
    color: var(--text-normal); /* Цвет текста */
    font-size: 1.125rem;
    margin: 0;
`;

const NoFiles: React.FC = () => (
    <NoFilesContainer>
        <NoFilesMessage>No tracked files found</NoFilesMessage>
    </NoFilesContainer>
);

export default NoFiles;
