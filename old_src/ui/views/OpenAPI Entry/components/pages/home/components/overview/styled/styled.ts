import styled from 'styled-components';

export const OverviewContainer = styled.div`
    display: flex;
    flex-direction: row;
    max-height: 600px;
    height: 100vh;
    background-color: var(--background-secondary);
    box-sizing: border-box;
    padding: 2rem;
    border-left: 1px solid var(--background-modifier-border);
`;

export const QuickActionsContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

export const Title = styled.h2`
    font-size: 1.4rem;
    color: var(--text-normal);
    font-weight: 600;
`;

export const Text = styled.div`
    font-size: 1.1rem;
    color: var(--text-muted);
    margin-bottom: 1.2rem;
    line-height: 1.5;
    gap: 8px;
    align-items: center;
    display: flex;
    justify-content: flex-start;

    &:hover {
        color: var(--interactive-accent);
        cursor: pointer;
    }
`;

export const FileManagerWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

export const BackButton = styled.button`
    align-self: flex-start;
    flex-shrink: 0;
`;
