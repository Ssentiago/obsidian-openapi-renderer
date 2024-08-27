import styled from 'styled-components';

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    padding: 20px;
`;
export const Card = styled.div<{
    $isCurrent?: boolean;
    $softDeleted?: boolean;
}>`
    background: ${(props) =>
        props.$isCurrent
            ? 'var(--color-highlight)'
            : props.$softDeleted
              ? 'var(--color-muted)'
              : 'var(--background-primary)'};
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
        transform: ${(props) =>
            props.$isCurrent ? 'none' : 'translateY(-5px)'};
        box-shadow: ${(props) =>
            props.$isCurrent
                ? 'none'
                : '0 6px 20px var(--background-modifier-box-shadow-hover)'};
    }
`;
export const Title = styled.h2`
    font-size: 1.5rem;
    margin: 0 0 10px;
    color: var(--text-normal);
`;
export const ButtonBase = styled.button`
    padding: 10px 15px;
    font-size: 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition:
        background-color 0.3s ease,
        transform 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-on-accent);

    &:hover {
        transform: scale(1.05);
    }

    &:focus {
        outline: 2px solid var(--interactive-accent);
    }
`;

export const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 20px;
`;
export const GroupTitle = styled.h3<{ $isOpen: boolean }>`
    font-size: 1.2rem;
    margin: 20px 0 10px;
    color: var(--text-normal);
    border-bottom: 1px solid var(--background-modifier-border);
    padding-bottom: 5px;
    cursor: pointer;

    &:after {
        content: '${(props) => (props.$isOpen ? '▲' : '▼')}';
        margin-left: 10px;
        font-size: 0.8rem;
    }
`;
export const Details = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;
export const Version = styled.span`
    font-size: 0.9rem;
    color: var(--text-muted);
`;
export const CreatedAt = styled.span`
    font-size: 0.9rem;
    color: var(--text-muted);
`;
export const PreviewButton = styled(ButtonBase)`
    background-color: var(--interactive-accent);
    color: var(--text-normal);

    &:hover {
        background-color: var(--interactive-accent-hover);
    }
`;
export const SaveButton = styled(ButtonBase)`
    background-color: var(--interactive-success);
    color: var(--text-normal);

    &:hover {
        background-color: var(--interactive-success-hover);
    }
`;
export const RestoreButton = styled(ButtonBase)`
    background-color: var(--interactive-success);
    color: var(--text-normal);

    &:hover {
        background-color: var(--interactive-success-hover);
    }
`;
export const DeleteButton = styled(ButtonBase)`
    background-color: var(--text-error-bg);
    color: var(--text-normal);

    &:hover {
        background-color: var(--text-error-bg-hover);
    }
`;
export const DeletePermanentlyButton = styled(DeleteButton)``;
export const ExportButton = styled(DeleteButton)``;
export const OpenInOpenAPIButton = styled(ButtonBase)`
    background-color: var(--interactive-normal);
    color: var(--text-normal);

    &:hover {
        background-color: var(--interactive-hover);
    }
`;
export const DiffButton = styled(ButtonBase)`
    background-color: var(--interactive-normal);
    color: var(--text-normal);

    &:hover {
        background-color: var(--interactive-hover);
    }
`;
