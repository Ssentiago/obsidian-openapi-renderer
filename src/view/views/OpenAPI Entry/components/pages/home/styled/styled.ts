import styled from 'styled-components';

export const EntryContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start; /* Выравниваем содержимое по верхнему краю */
    height: 100vh;
    background-color: var(--background-primary);
    padding-top: 20vh;
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
