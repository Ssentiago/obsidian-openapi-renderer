import { EventID } from 'events-management/typing/constants';
import {
    ReloadOpenAPIEntryStateEvent,
    UpdateOpenAPIViewStateEvent,
} from 'events-management/typing/interfaces';
import jsyaml from 'js-yaml';
import { Download, GitBranch, History, Trash } from 'lucide-react';
import React, { useState } from 'react';
import { FaChevronDown, FaPlus } from 'react-icons/fa';
import { SiOpenapiinitiative } from 'react-icons/si';
import { createNewLeaf } from 'view/common/helpers';
import { OPENAPI_VERSION_VIEW, OPENAPI_VIEW } from 'view/typing/types';
import {
    Action,
    ActionsContainer,
    DetailContainer,
    DetailContainerHeader,
    DetailContent,
    Item,
    ItemCount,
    ItemDate,
    ItemTitle,
    MainActionButton,
    MenuContainer,
} from 'view/views/OpenAPI Entry/components/pages/browse/components/grid-view/components/grid-item/styled/styled';
import { EntryView } from 'view/views/OpenAPI Entry/entry-view';

export const GridItem: React.FC<{
    view: EntryView;
    count: number;
    lastUpdate: number;
    path: string;
}> = ({ count, lastUpdate, view, path }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const toggleMenu = () => setIsOpen((prev) => !prev);

    const handleToggleDetails = (): void => {
        setDetailsOpen((prev) => !prev);
    };

    const handleOpenVersionView = async (): Promise<void> => {
        const versionLeaves =
            view.app.workspace.getLeavesOfType(OPENAPI_VERSION_VIEW);

        const existingView = versionLeaves.find(
            (leaf) => leaf.getViewState().state?.file === path
        );
        if (existingView) {
            const newViewState = {
                ...existingView.getViewState(),
                active: true,
            };
            await existingView.setViewState(newViewState);
        } else {
            const leaf = view.app.workspace.getLeaf(true);
            await leaf.setViewState({
                type: OPENAPI_VERSION_VIEW,
                active: true,
                state: {
                    file: path,
                },
            });
        }
    };

    const handleClickOnTitle = async (): Promise<void> => {
        await navigator.clipboard.writeText(path);
        view.plugin.showNotice('Copied');
    };

    const handleOpenOpenAPIView = async (): Promise<void> => {
        await createNewLeaf(OPENAPI_VIEW, view, path);
    };

    const handleExportFile = async () => {
        const data = await view.controller.getAllVersionsForFile(path);
        if (data) {
            await view.plugin.export.export(data);
            view.plugin.showNotice('Exported successfully');
        }
    };

    const handleRestoreFile = async () => {
        const versions = await view.controller.getAllVersionsForFile(path);
        if (!versions) {
            return;
        }
        const lastVersion = versions[versions.length - 1];
        const data = lastVersion.getPatchedVersion(versions).diff as string;
        const extension = lastVersion.path.match(/\.(.+)/)?.[1];
        if (!extension) {
            return;
        }

        await view.app.vault.adapter.write(
            lastVersion.path,
            extension === 'json'
                ? JSON.stringify(JSON.parse(data), null, 2)
                : jsyaml.dump(JSON.parse(data), {
                      indent: 2,
                  })
        );
        view.plugin.showNotice('Restored successfully');
        view.plugin.publisher.publish({
            eventID: EventID.UpdateOpenAPIViewState,
            timestamp: new Date(),
            emitter: view.app.workspace,
            data: {
                file: lastVersion.path,
            },
        } as UpdateOpenAPIViewStateEvent);
    };

    const handleDelete = async () => {
        const deleted = await view.controller.deleteFile(path);
        if (deleted) {
            view.plugin.publisher.publish({
                eventID: EventID.ReloadOpenAPIEntryState,
                emitter: view.plugin.app.workspace,
                timestamp: new Date(),
            } as ReloadOpenAPIEntryStateEvent);
            view.plugin.showNotice('Deleted successfully');
        }
    };

    return (
        <Item>
            <ItemTitle onClick={handleClickOnTitle}>{path}</ItemTitle>
            <DetailContainer>
                <DetailContainerHeader
                    $isOpen={detailsOpen}
                    onClick={handleToggleDetails}
                >
                    Details
                </DetailContainerHeader>
                {detailsOpen && (
                    <DetailContent>
                        <ItemCount>Version count: {count}</ItemCount>
                        <ItemDate>
                            Last update: {new Date(lastUpdate).toLocaleString()}
                        </ItemDate>
                    </DetailContent>
                )}
            </DetailContainer>
            <MenuContainer>
                <MainActionButton
                    title={`${!isOpen ? 'Show' : 'Hide'} actions`}
                    onClick={toggleMenu}
                >
                    {!isOpen ? <FaPlus /> : <FaChevronDown />}
                </MainActionButton>
                <ActionsContainer $isOpen={isOpen}>
                    <Action
                        title="Open in OpenAPI View"
                        onClick={handleOpenOpenAPIView}
                    >
                        <SiOpenapiinitiative />
                    </Action>
                    <Action
                        title="Open in Version View"
                        onClick={handleOpenVersionView}
                    >
                        <GitBranch />
                    </Action>
                    <Action title="Export" onClick={handleExportFile}>
                        <Download />
                    </Action>
                    <Action
                        title="Restore last file version (if it was deleted from the vault)"
                        onClick={handleRestoreFile}
                    >
                        <History />
                    </Action>
                    <Action
                        title="Remove file from tracking (file remains in vault)"
                        onClick={handleDelete}
                    >
                        <Trash />
                    </Action>
                </ActionsContainer>
            </MenuContainer>
        </Item>
    );
};
