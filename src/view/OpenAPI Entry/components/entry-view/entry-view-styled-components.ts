import styled from 'styled-components';

export const EntryContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start; /* Выравниваем содержимое по верхнему краю */
    height: 100vh;
    background-color: var(--background-primary);
    padding-top: 20vh; /* Отступ сверху, чтобы немного опустить от самого края */
    box-sizing: border-box;
`;

export const WelcomeMessage = styled.h1`
    font-size: 2.5rem;
    color: var(--text-normal);
    margin-bottom: 1.5rem;
`;

export const Description = styled.p`
    font-size: 1.2rem;
    color: var(--text-muted);
    margin-bottom: 3rem;
    text-align: center;
    max-width: 500px;
`;

export const ButtonGroup = styled.div`
    display: flex;
    gap: 2rem;
`;

export const ActionButton = styled.button`
    display: flex;
    align-items: center;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    color: var(--text-on-accent);
    background-color: var(--interactive-accent);
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: var(--interactive-accent-hover);
    }

    & > svg {
        margin-right: 0.5rem;
    }
`;
