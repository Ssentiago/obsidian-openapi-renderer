import styled from 'styled-components';

export const GridItem = styled.div<{ padding?: string }>`
    background-color: var(--color-base-20);
    padding: ${({ padding }) => padding || '16px'};
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    color: var(--text-normal);
    border: 1px solid var(--background-modifier-border);
    transition:
        background-color 0.3s ease,
        transform 0.3s ease;

    &:hover {
        background-color: var(--background-modifier-hover);
        transform: scale(1.05);
    }
`;
export const ItemTitle = styled.h3`
    margin: 0 0 8px 0;
    color: var(--text-accent);
    font-size: 1.25rem;
    text-align: center;
    cursor: pointer;
`;

export const ItemCount = styled.p`
    margin: 0;
    color: var(--text-muted);
    font-size: 1rem;
`;
export const ItemDate = styled.p`
    margin: 0;
    color: var(--text-faint);
    font-size: 0.875rem;
`;
