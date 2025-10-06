import styled from 'styled-components';

export const Item = styled.div<{ padding?: string }>`
    background-color: var(--color-base-20);
    padding: ${({ padding }) => padding ?? '16px'};
    color: var(--text-normal);
    border: 1px solid var(--background-modifier-border);
    transition:
        background-color 0.3s ease,
        transform 0.3s ease;

    &:hover {
        background-color: var(--background-modifier-active-hover);
        border: var(--background-modifier-border-hover) 1px solid;
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

export const DetailContainer = styled.div`
    background-color: var(--color-base-20);
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    margin: 20px auto;
    color: var(--color-base-100);
    overflow: hidden;
    transition:
        max-height 0.3s ease,
        padding 0.3s ease;
    max-height: 300px;
    padding: 16px;
`;

export const DetailContainerHeader = styled.h3<{ $isOpen: boolean }>`
    margin: 0;
    padding: 12px 16px;
    color: var(--color-base-100);
    cursor: pointer;
    border-radius: 4px;
    transition: box-shadow 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1rem;
    font-weight: 500;
    border: 1px solid var(--color-base-20);

    &:after {
        content: '${(props) => (props.$isOpen ? '▲' : '▼')}';
        margin-left: 10px;
        font-size: 0.8rem;
    }
`;

export const DetailContent = styled.div`
    padding: 10px 0;
    user-select: text;
`;

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

export const Action = styled.button`
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
