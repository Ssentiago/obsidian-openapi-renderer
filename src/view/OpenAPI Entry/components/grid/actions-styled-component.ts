import styled from 'styled-components';

export const ActionsContainer = styled.div<{
    $isOpen: boolean;
}>`
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    top: 120%;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--color-base-10);
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    gap: 8px;
    z-index: 10;
    visibility: ${(props) => (props.$isOpen ? 'visible' : 'hidden')};
    opacity: ${(props) => (props.$isOpen ? '1' : '0')};
    transition:
        opacity 0.3s ease,
        visibility 0.3s ease;
`;
export const MainActionButton = styled.button`
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
    position: relative;
    z-index: 20;

    &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.2);
    }
`;

export const MenuContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
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
export const RestoreAction = styled(ActionBase)``;
export const DeleteAction = styled(ActionBase)``;
