import styled from 'styled-components';

export const GridContainer = styled.div<{ columns?: number; gap?: string }>`
    display: grid;
    position: relative;
    grid-template-columns: ${({ columns }) => `repeat(${columns || 4}, 1fr)`};
    grid-auto-rows: auto;
    gap: ${({ gap }) => gap || '16px'};
    width: 100%;
    padding: 16px;
`;
