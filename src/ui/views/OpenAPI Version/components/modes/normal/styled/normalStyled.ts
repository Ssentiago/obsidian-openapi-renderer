import styled from 'styled-components';

export const Card = styled.div<{
    $softDeleted?: boolean;
}>`
    background: ${(props) =>
        props.$softDeleted
            ? 'var(--color-muted)'
            : 'var(--background-secondary)'};
    border: 1px solid var(--background-modifier-border);
    border-radius: 12px;
    padding: 20px;
    margin: 10px 0;
    box-shadow: 0 4px 12px var(--background-modifier-box-shadow);
    transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;
    opacity: ${(props) => (props.$softDeleted ? 0.6 : 1)};
    pointer-events: auto;

    &:hover {
        transform: 'translateY(-5px)';
        box-shadow: '0 6px 20px var(--background-modifier-box-shadow-hover)';
    }
`;
