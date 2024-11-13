import styled from 'styled-components';

export const Button = styled.button`
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

    & svg {
        height: 20px;
        width: 20px;
    }
`;

export const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 20px;
`;

export const Title = styled.h2`
    font-size: 1.5rem;
    margin: 0 0 10px;
`;
