import { debounce, TAbstractFile, TFile, TFolder } from 'obsidian';
import React, {
    Fragment,
    useCallback,
    useEffect,
    useReducer,
    useState,
} from 'react';
import { useEntryContext } from 'ui/views/OpenAPI Entry/components/core/context';
import AbstractFile from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/components/fileManager/components/file/AbstractFile';
import NewFile from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/components/fileManager/components/newFile/NewFile';
import { AnimatedFileListItem } from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/components/fileManager/components/newFile/styled/styled';
import { TemplateProvider } from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/components/fileManager/context/templateContext';
import {
    FileList,
    FileManagerContainer,
    FileManagerContent,
} from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/components/fileManager/styled';

const FileManager: React.FC = () => {
    const [expandedFolders, setExpandedFolders] = useState<Set<TFolder>>(
        new Set()
    );

    const { view, app, plugin } = useEntryContext();

    const [createFileData, setCreateFileData] = useState<{
        path: string;
        type: 'folder' | 'file';
        onExit: () => void;
    } | null>(null);

    const [, triggerUpdate] = useReducer((o) => !o, true);

    const onExternalUpdate = (file: TAbstractFile) => {
        if (file instanceof TFile && !/^(ya?ml|json)$/.test(file.extension)) {
            return;
        }
        triggerUpdate();
    };

    const debouncedUpdate = debounce(onExternalUpdate, 100);

    useEffect(() => {
        const createEventRef = app.vault.on('create', (file: TAbstractFile) => {
            debouncedUpdate(file);
        });
        const modifyEventRef = app.vault.on('modify', (file: TAbstractFile) => {
            debouncedUpdate(file);
        });
        const deleteEventRef = app.vault.on('delete', (file: TAbstractFile) => {
            debouncedUpdate(file);
        });
        const renameEventRef = app.vault.on('rename', (file: TAbstractFile) => {
            debouncedUpdate(file);
        });

        return (): void => {
            app.vault.offref(createEventRef);
            app.vault.offref(modifyEventRef);
            app.vault.offref(deleteEventRef);
            app.vault.offref(renameEventRef);
        };
    }, [app]);

    const sortChildren = useCallback(
        (children: TAbstractFile[]) =>
            children.toSorted((a, b) => {
                if (a instanceof TFolder && b instanceof TFolder) {
                    return a.path.localeCompare(b.path);
                } else if (a instanceof TFolder) {
                    return -1;
                } else if (b instanceof TFolder) {
                    return 1;
                }

                return a.path.localeCompare(b.path);
            }),
        [app]
    );

    const onExpandedStateChange = useCallback(
        (folder: TFolder, state: boolean) => {
            setExpandedFolders((prev) => {
                const updated = new Set(prev);
                if (state) {
                    updated.add(folder);
                } else {
                    updated.delete(folder);
                }
                return updated;
            });
        },
        [app]
    );

    const onCreateNewAbstractFile = useCallback(
        (type: 'file' | 'folder', path: string, onExit: () => void) => {
            setCreateFileData({ path, type, onExit });
            const dest = app.vault.getFolderByPath(path)!;
            setExpandedFolders((prev) => {
                const updated = new Set(prev);
                updated.add(dest);
                return updated;
            });
        },
        [app]
    );

    const onCreateEnd = useCallback(
        async (dest: string | null, type: 'folder' | 'file', data?: string) => {
            if (dest) {
                switch (type) {
                    case 'folder':
                        await app.vault.createFolder(dest);
                        break;
                    case 'file':
                        await app.vault.create(dest, data ?? '');
                        break;
                }
            }
            createFileData?.onExit();
            setCreateFileData(null);
        },
        [app]
    );

    const renderFilesTree = useCallback(
        (folder: TFolder | null, level: number) => {
            const children = folder ? folder.children : [app.vault.getRoot()];

            const filteredChildren = children.filter(
                (child) =>
                    child instanceof TFolder ||
                    /(ya?ml|json)$/.exec((child as TFile).extension)
            );

            return (
                <>
                    {sortChildren(filteredChildren).map((child) => (
                        <Fragment key={child.path}>
                            <AbstractFile
                                level={level}
                                file={child}
                                expandedInitialState={
                                    child instanceof TFolder
                                        ? expandedFolders.has(child)
                                        : false
                                }
                                onExpandedStateChange={onExpandedStateChange}
                                onCreateNewAbstractFile={
                                    onCreateNewAbstractFile
                                }
                            />
                            {child instanceof TFolder &&
                                expandedFolders.has(child) &&
                                renderFilesTree(child, level + 1)}
                        </Fragment>
                    ))}
                    <AnimatedFileListItem inProp={!!createFileData}>
                        <TemplateProvider>
                            {folder?.path === createFileData?.path &&
                                createFileData && (
                                    <NewFile
                                        level={level}
                                        path={createFileData.path}
                                        type={createFileData.type}
                                        onCreateEnd={onCreateEnd}
                                    />
                                )}
                        </TemplateProvider>
                    </AnimatedFileListItem>
                </>
            );
        },
        [expandedFolders, createFileData]
    );

    return (
        <>
            <FileManagerContainer>
                <FileManagerContent>
                    <FileList>{renderFilesTree(null, 0)}</FileList>
                </FileManagerContent>
            </FileManagerContainer>
        </>
    );
};

export default FileManager;
