import styled from 'styled-components';

export const NavbarContainer = styled.div`
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    height: 60px;
    background-color: var(--background-primary);
    border-bottom: 1px solid var(--color-base-20);
    padding: 0 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const NavbarButton = styled.button`
    background: none;
    border: none;
    color: var(--text-normal);
    font-size: 1rem;
    cursor: pointer;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: color 0.3s ease;

    &:hover {
        color: var(--text-accent);
    }

    &.active {
        color: var(--text-accent);
        font-weight: bold;
    }

    svg {
        font-size: 1.25rem;
    }
`;

export const HomeButton = styled(NavbarButton)``;

export const CreateButton = styled(NavbarButton)``;

export const BrowseButton = styled(NavbarButton)``;
