import React from 'react';
import {
    DetailContainer,
    DetailContainerHeader,
    DetailContent,
} from './detail-container';
import { useEntryContext } from '../core/context';
import {
    GridItem,
    ItemCount,
    ItemDate,
    ItemTitle,
} from './grid-item-styled-component';
import {
    ActionsContainer,
    ExportAction,
    OpenOpenAPIAction,
    OpenVersionViewAction,
} from './actions-styled-component';
import { FaHistory } from 'react-icons/fa';
import { SiOpenapiinitiative } from 'react-icons/si';
import { OpenAPIEntryView } from '../../OpenAPI-entry-view';
import { OPENAPI_VERSION_VIEW_TYPE, OPENAPI_VIEW_TYPE } from '../../../types';
import { BiExport } from 'react-icons/bi';

export const GridItemComponent: React.FC<{
    view: OpenAPIEntryView;
    title: string;
    count: number;
    lastUpdate: string;
}> = ({ title, count, lastUpdate, view }) => {
    const { detailsOpen, setDetailsOpen } = useEntryContext();

    const handleToggleDetails = (title: string): void => {
        setDetailsOpen((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    const handleOpenVersionView = async (filePath: string): Promise<void> => {
        const versionLeaves = view.app.workspace.getLeavesOfType(
            OPENAPI_VERSION_VIEW_TYPE
        );

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
                type: OPENAPI_VERSION_VIEW_TYPE,
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
        const openAPILeaves =
            view.app.workspace.getLeavesOfType(OPENAPI_VIEW_TYPE);

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
                type: OPENAPI_VIEW_TYPE,
                active: true,
                state: {
                    file: filePath,
                },
            });
        }
    };

    return (
        <GridItem>
            <ItemTitle onClick={() => handleClickOnTitle(title)}>
                {title}
            </ItemTitle>
            <DetailContainer>
                <DetailContainerHeader
                    isOpen={detailsOpen[title]}
                    onClick={() => handleToggleDetails(title)}
                >
                    Details
                </DetailContainerHeader>
                {detailsOpen[title] && (
                    <DetailContent>
                        <ItemCount>Version count: {count}</ItemCount>
                        <ItemDate>Last update: {lastUpdate}</ItemDate>
                    </DetailContent>
                )}
            </DetailContainer>
            <ActionsContainer>
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
                    <FaHistory />
                </OpenVersionViewAction>
                <ExportAction>
                    <BiExport />
                </ExportAction>
            </ActionsContainer>
        </GridItem>
    );
};
