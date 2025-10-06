import yaml from 'js-yaml';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
    Menu,
    moment,
    requestUrl,
    TAbstractFile,
    TFile,
    TFolder,
} from 'obsidian';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { x } from 'tar';
import { newConvertData } from 'ui/common/helpers';
import { OPENAPI_VERSION_VIEW, OPENAPI_VIEW } from 'ui/typing/types';
import { useEntryContext } from 'ui/views/OpenAPI Entry/components/core/context';
import { RequestUrlModal } from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/components/fileManager/components/file/modal/request-url-modal';
import useFileNameValidation from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/components/fileManager/hooks/ErrorHook';
import {
    ErrorContainer,
    ErrorText,
    ExpandButton,
    FileListItem,
    FileName,
    FileTag,
    FileInput,
} from 'ui/views/OpenAPI Entry/components/pages/home/components/overview/components/fileManager/styled';

interface FileProps {
    level: number;
    file: TAbstractFile;
    expandedInitialState: boolean;
    onExpandedStateChange: (folder: TFolder, state: boolean) => void;
    onCreateNewAbstractFile: (
        type: 'file' | 'folder',
        path: string,
        onExit: () => void
    ) => void;
}

const grabAriaLabelData = (child: TAbstractFile) => {
    if (child instanceof TFolder) {
        const children = child.children;
        const files = children.filter(
            (f) => f instanceof TFile && /.(ya?ml|json)$/.exec(f.name)
        ).length;
        const folders = children.filter((f) => f instanceof TFolder).length;
        const folderSuffix = folders > 1 || folders === 0 ? 's' : '';
        const fileSuffix = files > 1 || files === 0 ? 's' : '';
        return `${files} file${fileSuffix}, ${folders} folder${folderSuffix}`;
    } else if (child instanceof TFile) {
        const modified = moment(child.stat.mtime).format('YYYY-MM-DD HH:mm:ss');
        const created = moment(child.stat.ctime).format('YYYY-MM-DD HH:mm:ss');
        return `Last modified at ${modified}\nCreated at ${created}`;
    }
};

const AbstractFile: React.FC<FileProps> = ({
    level,
    file,
    expandedInitialState,
    onExpandedStateChange,
    onCreateNewAbstractFile,
}) => {
    const { app, plugin } = useEntryContext();

    const inputRef = useRef<HTMLInputElement>(null);
    const { error, validateName, handleErrorClear } = useFileNameValidation(
        file.path,
        'rename'
    );

    const [expanded, setExpanded] = useState<boolean | undefined>(
        file instanceof TFile ? undefined : false
    );

    useEffect(() => {
        if (expandedInitialState !== undefined) {
            setExpanded(expandedInitialState);
        }
    }, [expandedInitialState]);

    const [isShaking, setIsShaking] = useState(false);

    const [isRename, setIsRename] = useState<boolean>(false);

    const [, setIsCreate] = useState<boolean>(false);

    useEffect(() => {
        if (isRename && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(
                0,
                inputRef.current.value.length
            );
        }
    }, [isRename]);

    const escapeHandler = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsRename((prev) => {
                    if (prev) {
                        return false;
                    }
                    return prev;
                });
            }
        },
        [app, isRename]
    );

    useEffect(() => {
        document.addEventListener('keydown', escapeHandler);
        return () => {
            document.removeEventListener('keydown', escapeHandler);
        };
    }, [app]);

    const handleExpandButtonClick = useCallback(() => {
        setExpanded((prev) => {
            if (prev === undefined) {
                return prev;
            }
            file instanceof TFolder && onExpandedStateChange(file, !prev);
            return !prev;
        });
    }, [file, expanded]);

    const onRenameEnter = useCallback(
        async (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key !== 'Enter') {
                return;
            }

            if (error.trim()) {
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 300);
            } else if (isRename) {
                const baseName = e.currentTarget.value;
                const newName = `${baseName}${file instanceof TFile ? `.${file.extension}` : ''}`;
                await app.vault.rename(file, newName);
                handleErrorClear();
                setIsRename(false);
            }
        },
        [app, isRename, error]
    );

    const inputOnRename = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            if (isRename) {
                await validateName(value);
            }
        },
        [app, isRename, isShaking]
    );

    const onContextMenu = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            const nativeEvent = e.nativeEvent;

            const menu = new Menu();

            if (file instanceof TFolder) {
                menu.addItem((item) => {
                    item.setIcon('edit');
                    item.setTitle('New OpenAPI spec file');
                    item.onClick(() => {
                        setIsCreate(true);
                        onCreateNewAbstractFile('file', file.path, () => {
                            setIsCreate(false);
                        });
                    });
                });

                menu.addItem((item) => {
                    item.setIcon('folder-open');
                    item.setTitle('New folder');
                    item.onClick(() => {
                        setIsCreate(true);
                        onCreateNewAbstractFile('folder', file.path, () => {
                            setIsCreate(false);
                        });
                    });
                });
            } else {
                menu.addItem((item) => {
                    item.setIcon('circle-dot');
                    item.setTitle('Open in OpenApi View');
                    item.onClick(async () => {
                        const leaf = app.workspace.getLeaf(true);
                        await leaf.setViewState({
                            type: OPENAPI_VIEW,
                            active: false,
                            state: {
                                file: file.path,
                            },
                        });
                    });
                });

                menu.addItem((item) => {
                    item.setIcon('git-branch');
                    item.setTitle('Open in OpenApi Version View');
                    item.onClick(async () => {
                        const leaf = app.workspace.getLeaf(true);
                        await leaf.setViewState({
                            type: OPENAPI_VERSION_VIEW,
                            active: false,
                            state: {
                                file: file.path,
                            },
                        });
                    });
                });
                menu.addSeparator();

                menu.addItem((item) => {
                    item.setIcon('copy');
                    item.setTitle('Copy Obsidian Path');
                    item.onClick(async () => {
                        await navigator.clipboard.writeText(
                            `obsidian://openapi-open?openapiPath=${file.path}`
                        );
                        plugin.showNotice('URL copied to your clipboard');
                    });
                });
            }

            menu.addSeparator();

            if (file !== app.vault.getRoot()) {
                menu.addItem((item) => {
                    item.setIcon('pencil');
                    item.setTitle('Rename');
                    item.onClick(() => {
                        setIsRename(true);
                    });
                });
                menu.addItem((item) => {
                    item.setIcon('trash');
                    item.setTitle('Delete');
                    item.onClick(async () => {
                        await app.vault.delete(file);
                    });
                });
            }

            menu.showAtMouseEvent(nativeEvent);
        },
        [app]
    );

    const createDragImage = (dragTarget?: TAbstractFile) => {
        const dragImage = document.createElement('div');
        dragImage.id = 'custom-drag-image';
        dragImage.style.position = 'absolute';
        dragImage.style.display = 'flex';
        dragImage.style.flexDirection = 'column';
        dragImage.style.backgroundColor = '#000';
        dragImage.style.padding = '10px';
        dragImage.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        dragImage.style.pointerEvents = 'none';
        const fileNameSpan = document.createElement('span');
        const moveToSpan = document.createElement('span');

        fileNameSpan.id = 'file-name';
        moveToSpan.id = 'move-to';

        fileNameSpan.style.fontSize = '16px';
        fileNameSpan.style.color = '#fff';
        moveToSpan.style.fontSize = '14px';
        moveToSpan.style.color = '#ccc';

        fileNameSpan.textContent = file.name;
        moveToSpan.textContent = `Move into ${!dragTarget ? `${app.vault.getName()}` : dragTarget.name}`;
        dragImage.appendChild(fileNameSpan);
        dragImage.appendChild(moveToSpan);
        document.body.appendChild(dragImage);
        return dragImage;
    };

    const onDoubleClick = useCallback(async () => {
        if (file instanceof TFolder) {
            handleExpandButtonClick();
        } else {
            const leaf = app.workspace.getLeaf(true);
            await leaf.setViewState({
                type: OPENAPI_VIEW,
                active: true,
                state: {
                    file: file.path,
                },
            });
            await app.workspace.revealLeaf(leaf);
        }
    }, [file]);

    return (
        <>
            <FileListItem
                data-file-type={file instanceof TFolder ? 'folder' : 'file'}
                data-file-path={file.path}
                onContextMenu={onContextMenu}
                onDoubleClick={onDoubleClick}
                style={{ paddingLeft: `${level * 20}px` }}
                aria-label={grabAriaLabelData(file)}
            >
                <FileName>
                    <ExpandButton onClick={handleExpandButtonClick}>
                        {file instanceof TFolder &&
                            (expanded ? <ChevronDown /> : <ChevronRight />)}
                    </ExpandButton>
                    {isRename ? (
                        <>
                            <FileInput
                                ref={inputRef}
                                defaultValue={
                                    file instanceof TFile
                                        ? file.basename
                                        : file.name
                                }
                                onBlur={() => {
                                    setIsRename(false);
                                    handleErrorClear();
                                }}
                                onKeyDown={onRenameEnter}
                                onChange={inputOnRename}
                            />
                            {file instanceof TFile && (
                                <FileTag>{file.extension}</FileTag>
                            )}
                        </>
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                gap: '8px',
                            }}
                        >
                            <span>
                                {file instanceof TFile
                                    ? file.basename
                                    : file.name}
                            </span>
                            {file instanceof TFile && (
                                <FileTag>{file.extension}</FileTag>
                            )}
                        </div>
                    )}
                </FileName>
                {error.trim() && (
                    <ErrorContainer isShaking={isShaking}>
                        <ErrorText>{error}</ErrorText>
                    </ErrorContainer>
                )}
            </FileListItem>
        </>
    );
};

export default AbstractFile;
