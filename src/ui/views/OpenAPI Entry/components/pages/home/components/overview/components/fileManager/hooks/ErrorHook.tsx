import { normalizePath, TAbstractFile, TFile } from 'obsidian';
import { useEffect, useState } from 'react';
import { useEntryContext } from 'ui/views/OpenAPI Entry/components/core/context';

const useFileNameValidation = (
    basePath: string,
    mode: 'create' | 'rename',
    type?: 'folder' | 'file'
) => {
    const [error, setError] = useState<string>('');
    const handleErrorClear = () => {
        setError('');
    };
    const { app } = useEntryContext();

    useEffect(() => {
        document.addEventListener('mousemove', handleErrorClear);
        document.addEventListener('wheel', handleErrorClear);
        return (): void => {
            document.removeEventListener('mousemove', handleErrorClear);
            document.removeEventListener('wheel', handleErrorClear);
        };
    }, []);

    const isNameEmpty = (value: string) => {
        return value.trim().length === 0;
    };

    const isThereBannedChars = (value: string) => {
        return value.search(/[/\\:]/) !== -1;
    };

    const isThatPathExists = async (value: string) => {
        if (mode === 'rename') {
            const fileName = /\/?([^\/]+)$/.exec(basePath)?.[1];
            const itemBasePath = basePath.replace(fileName!, '');
            const newItemPath = normalizePath(`${itemBasePath}/${value}`);
            return value !== fileName && app.vault.adapter.exists(newItemPath);
        } else if (mode === 'create') {
            const itemBasePath = normalizePath(`${basePath}/${value}`);
            return app.vault.adapter.exists(itemBasePath);
        }
    };

    const isWrongExtension = (value: string) => {
        if (type === 'file') {
            return !/.+?\.(ya?ml|json)$/.test(value);
        }
    };

    const validateName = async (value: string) => {
        if (isNameEmpty(value)) {
            setError('File name cannot be empty');
            return false;
        }

        if (isThereBannedChars(value)) {
            setError('File name cannot contains any of these characters: \\/:');
            return false;
        }

        if (await isThatPathExists(value)) {
            setError(`There's already a file with the same name`);
            return false;
        }

        if (isWrongExtension(value)) {
            setError('File extension must be one of: yaml, yml, or json');
            return false;
        }

        setError('');
        return true;
    };

    return {
        error,
        setError,
        validateName,
        handleErrorClear,
    };
};

export default useFileNameValidation;
