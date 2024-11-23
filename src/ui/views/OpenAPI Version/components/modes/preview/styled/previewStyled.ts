import styled from 'styled-components';

export const PreviewHeader = styled.h1`
    font-size: 2.5rem;
    text-align: center;
    margin-top: 20px;
    color: var(--text-normal);
    border-bottom: 2px solid var(--interactive-accent);
    padding-bottom: 10px;
`;

export const SpecDetails = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin: 20px 0;
    padding: 20px;
    max-width: 600px;
    background-color: var(--background-secondary);
    box-shadow: 0 4px 12px var(--background-modifier-box-shadow);

    & > p {
        margin: 12px 0;
        font-size: 1.1rem;
        color: var(--text-muted);
    }
`;
