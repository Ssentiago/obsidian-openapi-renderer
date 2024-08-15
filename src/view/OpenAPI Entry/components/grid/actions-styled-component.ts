import styled from 'styled-components';

export const ActionsContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 12px;
    padding: 16px;
    background-color: var(--color-base-10);
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

export const ActionBase = styled.button`
    background-color: var(--color-primary);
    color: var(--color-white);
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition:
        background-color 0.3s ease,
        transform 0.3s ease;

    &:hover {
        background-color: var(--color-primary-dark);
        transform: scale(1.05);
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.2);
    }
`;

export const OpenVersionViewAction = styled(ActionBase)``;

export const OpenOpenAPIAction = styled(ActionBase)``;

export const ExportAction = styled(ActionBase)``;
