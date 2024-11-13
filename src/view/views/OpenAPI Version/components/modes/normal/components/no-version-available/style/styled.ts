import styled from 'styled-components';

export const MessageContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 20px;
    text-align: center;
    background-color: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 8px;
    box-shadow: 0 2px 10px var(--background-modifier-box-shadow);
    color: var(--text-muted);
`;

export const MessageTitle = styled.h2`
    font-size: 1.5rem;
    margin: 0 0 10px;
    color: var(--text-normal);
`;

export const MessageSubtitle = styled.p`
    font-size: 1rem;
    margin: 0;
    color: var(--text-muted);
`;
