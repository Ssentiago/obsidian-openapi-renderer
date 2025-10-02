import { normalizePath } from 'obsidian';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { newConvertData } from 'ui/common/helpers';
import { useEntryContext } from 'ui/views/OpenAPI Entry/components/core/context';
import Template from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/components/fileManager/components/newFile/Template';
import { useTemplateManager } from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/components/fileManager/context/templateContext';
import useFileNameValidation from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/components/fileManager/hooks/ErrorHook';
import {
    ErrorContainer,
    ErrorText,
    FileInput,
    FileListItem,
    FileName,
} from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/components/fileManager/styled';

interface NewFileProps {
    level: number;
    path: string;
    type: 'folder' | 'file';
    onCreateEnd: (
        finalPath: string | null,
        type: 'folder' | 'file',
        data?: string
    ) => void;
}

const NewFile: React.FC<NewFileProps> = ({
    level,
    path,
    type,
    onCreateEnd,
}) => {
    const { app } = useEntryContext();

    const inputRef = useRef<HTMLInputElement>(null);

    const { data } = useTemplateManager();

    const { error, setError, validateName } = useFileNameValidation(
        path,
        'create',
        type
    );

    const [isShaking, setIsShaking] = useState(false);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [inputRef]);

    const escapeHandler = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onCreateEnd(null, type);
            }
        },
        [app]
    );

    useEffect(() => {
        document.addEventListener('keydown', escapeHandler);
        return () => {
            document.removeEventListener('keydown', escapeHandler);
        };
    }, [app]);

    const onRenameEnter = useCallback(
        async (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key !== 'Enter') {
                return;
            }

            const value = e.currentTarget.value;

            const validated = await validateName(value);

            if (!validated) {
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 300);
                return;
            }

            if (error.trim()) {
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 300);
                return;
            }

            let content = data;

            const ext = value.split('.').pop()!;

            switch (ext) {
                case 'yaml':
                case 'yml':
                    content = newConvertData(content, 'yaml', true);
                    break;
                case 'json':
                    content = newConvertData(content, 'json', true);
                    break;
            }

            const newItemPath = normalizePath(`${path}/${value}`);
            onCreateEnd(newItemPath, type, content);
        },
        [app, error, data]
    );

    const inputOnRename = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            await validateName(e.target.value);
        },
        [app, isShaking]
    );

    return (
        <FileListItem style={{ paddingLeft: `${level * 20}px` }}>
            <FileName>
                <FileInput
                    ref={inputRef}
                    defaultValue={''}
                    onKeyDown={onRenameEnter}
                    onChange={inputOnRename}
                />
                {type === 'file' && <Template />}
            </FileName>
            {error.trim() && (
                <ErrorContainer isShaking={isShaking}>
                    <ErrorText>{error}</ErrorText>
                </ErrorContainer>
            )}
        </FileListItem>
    );
};

export default NewFile;
