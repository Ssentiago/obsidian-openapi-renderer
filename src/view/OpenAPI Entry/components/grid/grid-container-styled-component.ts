import styled from 'styled-components';

export const GridContainer = styled.div<{ columns?: number; gap?: string }>`
    display: grid;
    position: relative;
    grid-template-columns: ${({ columns }) => `repeat(${columns || 4}, 1fr)`};
    grid-auto-rows: auto;
    gap: ${({ gap }) => gap || '16px'};
    width: 100%;
    padding: 16px;
    background-color: var(--background-primary);
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;
