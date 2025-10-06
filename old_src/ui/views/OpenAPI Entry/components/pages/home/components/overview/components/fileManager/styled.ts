import styled, { css, keyframes } from 'styled-components';

export const FileManagerContainer = styled.div`
    width: 450px;
    max-height: 600px;
    overflow-y: scroll;
    background-color: var(--background-secondary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 8px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
`;

export const FileManagerContent = styled.div`
    padding: 16px 20px;
`;

export const FileList = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
`;

export const FileListItem = styled.li`
    position: relative;
    margin: 0;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--color-base-20);
    transition: background-color 0.3s ease;
    cursor: pointer;

    &:hover {
        background-color: var(--background-modifier-hover);
    }
`;

export const FileName = styled.span`
    flex: 1;
    font-size: 1rem;
    color: var(--text-normal);
    display: flex;
    gap: 8px;
    align-items: center;
`;

export const ExpandButton = styled.span`
    font-size: 0.875rem;
    margin-right: 8px;
    cursor: pointer;
    color: var(--text-normal);

    svg {
        width: 20px;
        height: 20px;
    }

    &:hover {
        color: var(--color-blue);
    }
`;
export const FileInput = styled.input`
    width: 100%;
    font-size: 1rem;
    border: 1px solid var(--color-base-35);
    border-radius: 5px;
    background-color: var(--color-base-20);
    color: var(--text-normal);
    box-sizing: border-box;
    transition:
        border-color 0.3s ease,
        background-color 0.3s ease;
    &:focus {
        border: 2px solid var(--interactive-accent);
    }
`;

const shake = keyframes`
    0% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-5px); }
    100% { transform: translateX(0); }
`;

export const ErrorContainer = styled.div<{ isShaking: boolean }>`
    position: absolute;
    background-color: #f44336;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    z-index: 100;
    margin-top: 80px;
    animation: ${({ isShaking }) =>
        isShaking &&
        css`
            ${shake} 0.3s
        `};

    &:before {
        content: '';
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 0 8px 8px 8px;
        border-color: transparent transparent #f44336 transparent;
    }
`;

export const ErrorText = styled.span`
    font-weight: 400;
`;

export const FileTag = styled.div`
    display: inline-flex;
    align-self: flex-end;
    align-items: center;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: bold;
    border-radius: 4px;
    text-transform: uppercase;
    color: var(--nav-item-color);
    background-color: var(--background-modifier-hover);
`;
