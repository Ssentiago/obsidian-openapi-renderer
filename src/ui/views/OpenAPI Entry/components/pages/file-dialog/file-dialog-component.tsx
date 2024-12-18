import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { TAbstractFile, TFile, TFolder } from 'obsidian';
import React, { useEffect, useState } from 'react';
import { useEntryContext } from 'ui/views/OpenAPI Entry/components/core/context';
import {
    CreateFileButton,
    ExpandButton,
    FileDialogContainer,
    FileDialogContent,
    FileDialogHeader,
    FileList,
    FileListItem,
    FileName,
} from 'ui/views/OpenAPI Entry/components/pages/file-dialog/file-dialog-styled-components';
import { CreateFileModal } from 'ui/views/OpenAPI Entry/components/pages/file-dialog/modals/create-file-modal';

export const FileDialogComponent: React.FC = () => {
    const { view } = useEntryContext();

    const [folderMap, setFolderMap] = useState<
        Map<TFolder | null, (TFile | TFolder)[]>
    >(new Map());
    const [expandedFolders, setExpandedFolders] = useState<Set<TFolder>>(
        new Set()
    );

    useEffect(() => {
        const allFiles: TAbstractFile[] = view.app.vault.getAllLoadedFiles();

        const map = new Map<TFolder | null, (TFile | TFolder)[]>();
        map.set(null, []);

        allFiles.forEach((abstractFile) => {
            const parent = abstractFile.parent ?? null;
            if (!map.has(parent)) {
                map.set(parent, []);
            }
            if (
                (abstractFile instanceof TFile &&
                    ['json', 'yaml', 'yml'].includes(abstractFile.extension)) ||
                abstractFile instanceof TFolder
            ) {
                map.get(parent)?.push(abstractFile);
            }
        });

        setFolderMap(map);
    }, [view]);

    const handleClick = (folder: TFolder): void => {
        setExpandedFolders((prev): Set<TFolder> => {
            const updated = new Set(prev);
            if (updated.has(folder)) {
                updated.delete(folder);
            } else {
                updated.add(folder);
            }
            return updated;
        });
    };

    const getChildFolders = (parent: TFolder | null): (TFile | TFolder)[] =>
        folderMap.get(parent) ?? [];

    const renderFolders = (
        parent: TFolder | null,
        level: number
    ): React.JSX.Element[] => {
        const childFolders = getChildFolders(parent);

        return childFolders.map((folder) => (
            <React.Fragment key={folder.path}>
                <FileListItem
                    onClick={() => handleClick(folder as TFolder)}
                    style={{ paddingLeft: `${level * 20}px` }}
                >
                    <FileName>
                        <ExpandButton>
                            {expandedFolders.has(folder as TFolder) ? (
                                <ChevronDown />
                            ) : (
                                <ChevronRight />
                            )}
                        </ExpandButton>
                        {folder.path}
                        {folder instanceof TFolder && (
                            <CreateFileButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    new CreateFileModal(
                                        view.app,
                                        folder.path
                                    ).open();
                                }}
                            >
                                <Plus />
                            </CreateFileButton>
                        )}
                    </FileName>
                </FileListItem>
                {expandedFolders.has(folder as TFolder) &&
                    renderFolders(folder as TFolder, level + 1)}
            </React.Fragment>
        ));
    };

    return (
        <FileDialogContainer>
            <FileDialogHeader>
                Select a folder to create a spec and press plus button.
            </FileDialogHeader>
            <FileDialogContent>
                <FileList>{renderFolders(null, 0)}</FileList>
            </FileDialogContent>
        </FileDialogContainer>
    );
};
