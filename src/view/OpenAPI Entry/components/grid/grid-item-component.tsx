import jsyaml from 'js-yaml';
import React, { useState } from 'react';
import { BiExport } from 'react-icons/bi';
import {
    FaChevronDown,
    FaCodeBranch,
    FaHistory,
    FaPlus,
    FaTrash,
} from 'react-icons/fa';
import { SiOpenapiinitiative } from 'react-icons/si';
import { eventID } from '../../../../events-management/typing/constants';
import {
    ReloadOpenAPIEntryStateEvent,
    UpdateOpenAPIViewStateEvent,
} from '../../../../events-management/typing/interfaces';
import { OPENAPI_VERSION_VIEW, OPENAPI_VIEW } from '../../../typing/types';
import { OpenAPIEntryView } from '../../OpenAPI-entry-view';
import { useEntryContext } from '../core/context';
import {
    ActionsContainer,
    DeleteAction,
    ExportAction,
    MainActionButton,
    MenuContainer,
    OpenOpenAPIAction,
    OpenVersionViewAction,
    RestoreAction,
} from './actions-styled-component';
import {
    DetailContainer,
    DetailContainerHeader,
    DetailContent,
} from './detail-container';
import {
    GridItem,
    ItemCount,
    ItemDate,
    ItemTitle,
} from './grid-item-styled-component';

export const GridItemComponent: React.FC<{
    view: OpenAPIEntryView;
    title: string;
    count: number;
    lastUpdate: number;
    path: string;
}> = ({ title, count, lastUpdate, view, path }) => {
    const { detailsOpen, setDetailsOpen } = useEntryContext();

    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen((prev) => !prev);

    const handleToggleDetails = (title: string): void => {
        setDetailsOpen((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    const handleOpenVersionView = async (filePath: string): Promise<void> => {
        const versionLeaves =
            view.app.workspace.getLeavesOfType(OPENAPI_VERSION_VIEW);

        const existingView = versionLeaves.find(
            (leaf) => leaf.getViewState().state.file === filePath
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
                    file: filePath,
                },
            });
        }
    };

    const handleClickOnTitle = async (title: string): Promise<void> => {
        await navigator.clipboard.writeText(title);
        view.plugin.showNotice('Copied');
    };

    const handleOpenOpenAPIView = async (filePath: string): Promise<void> => {
        const openAPILeaves = view.app.workspace.getLeavesOfType(OPENAPI_VIEW);

        const existingView = openAPILeaves.find(
            (leaf) => leaf.getViewState().state.file === filePath
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
                type: OPENAPI_VIEW,
                active: true,
                state: {
                    file: filePath,
                },
            });
        }
    };

    const handleExportFile = async () => {
        const data = await view.controller.getAllVersionsForFile(path);
        if (data) {
            await view.plugin.export.export(data);
            view.plugin.showNotice('Exported successfully');
        }
    };

    const handleRestoreFile = async (path: string) => {
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
                : (jsyaml.dump(JSON.parse(data), {
                      indent: 2,
                  }) as string)
        );
        view.plugin.showNotice('Restored successfully');
        view.plugin.publisher.publish({
            eventID: eventID.UpdateOpenAPIViewState,
            timestamp: new Date(),
            emitter: view.app.workspace,
            data: {
                file: lastVersion.path,
            },
        } as UpdateOpenAPIViewStateEvent);
    };

    const handleDelete = async (path: string) => {
        const deleted = await view.controller.deleteFile(path);
        if (deleted) {
            view.plugin.publisher.publish({
                eventID: eventID.ReloadOpenAPIEntryState,
                emitter: view.plugin.app.workspace,
                timestamp: new Date(),
            } as ReloadOpenAPIEntryStateEvent);
            view.plugin.showNotice('Deleted successfully');
        }
    };

    return (
        <GridItem>
            <ItemTitle onClick={() => handleClickOnTitle(title)}>
                {title}
            </ItemTitle>
            <DetailContainer>
                <DetailContainerHeader
                    $isOpen={detailsOpen[title]}
                    onClick={() => handleToggleDetails(title)}
                >
                    Details
                </DetailContainerHeader>
                {detailsOpen[title] && (
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
                    <OpenOpenAPIAction
                        title="Open in OpenAPI View"
                        onClick={() => handleOpenOpenAPIView(title)}
                    >
                        <SiOpenapiinitiative />
                    </OpenOpenAPIAction>
                    <OpenVersionViewAction
                        title="Open in Version View"
                        onClick={() => handleOpenVersionView(title)}
                    >
                        <FaCodeBranch />
                    </OpenVersionViewAction>
                    <ExportAction title="Export" onClick={handleExportFile}>
                        <BiExport />
                    </ExportAction>
                    <RestoreAction
                        title="Restore last file version (if it was deleted from the vault)"
                        onClick={() => handleRestoreFile(title)}
                    >
                        <FaHistory />
                    </RestoreAction>
                    <DeleteAction
                        title="Remove file from tracking (file remains in vault)"
                        onClick={() => handleDelete(title)}
                    >
                        <FaTrash />
                    </DeleteAction>
                </ActionsContainer>
            </MenuContainer>
        </GridItem>
    );
};
