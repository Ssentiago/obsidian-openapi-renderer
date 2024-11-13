import styled from 'styled-components';

export const FileDialogContainer = styled.div`
    width: 450px;
    max-height: 700px;
    overflow-y: auto;
    border: 1px solid var(--color-base-20);
    background-color: var(--background-primary);
    border-radius: 8px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    margin: 0 auto; /* Центрирование по ширине */
    display: flex;
    flex-direction: column;
`;

export const FileDialogHeader = styled.h2`
    margin: 0;
    padding: 16px 20px;
    background-color: var(--background-secondary);
    color: var(--text-normal);
    border-bottom: 1px solid var(--color-base-30);
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
`;

export const FileDialogContent = styled.div`
    padding: 16px 20px;
`;

export const FileList = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
`;

export const FileListItem = styled.li`
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
    align-items: center;
`;

export const CreateFileButton = styled.button`
    background: none;
    border: none;
    color: var(--text-normal);
    font-size: 1rem;
    cursor: pointer;
    padding: 4px;
    margin-left: 8px;
    display: flex;
    align-items: center;
    transition: color 0.3s ease;

    &:hover {
        color: var(--text-accent); /* Accent color on hover */
    }

    svg {
        font-size: 1rem;
    }
`;

export const ExpandButton = styled.span`
    font-size: 0.875rem;
    margin-right: 8px;
    cursor: pointer;
    color: var(--text-normal);

    svg {
        font-size: 0.875rem;
    }

    &:hover {
        color: var(--color-blue);
    }
`;
