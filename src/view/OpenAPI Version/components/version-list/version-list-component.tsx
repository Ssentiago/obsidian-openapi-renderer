import jsyaml from 'js-yaml';
import { moment } from 'obsidian';
import React from 'react';
import {
    FaCalendarAlt,
    FaCodeBranch,
    FaDownload,
    FaEye,
    FaTrash,
    FaTrashAlt,
    FaUndo,
} from 'react-icons/fa';
import { EventID } from '../../../../events-management/typing/constants';
import { UpdateOpenAPIViewStateEvent } from '../../../../events-management/typing/interfaces';
import { Specification } from '../../../../indexedDB/database/specification';
import { OpenAPIVersionView } from '../../openapi-version-view';
import { useSpecificationContext } from '../core/context';
import {
    ButtonGroup,
    Card,
    CreatedAt,
    DeleteButton,
    DeletePermanentlyButton,
    Details,
    DiffButton,
    ExportButton,
    GroupTitle,
    PreviewButton,
    RestoreButton,
    Title,
    Version,
} from '../styled/styled-components';

const getReadableDate: (date: Date) => { id: number; label: string } = (
    date: Date
) => {
    const now = moment().startOf('day');
    const dateMoment = moment(date).startOf('day');
    const dayDiff = now.diff(dateMoment, 'days');

    if (dayDiff === 0) {
        return { id: 0, label: 'Today' };
    }
    if (dayDiff === 1) {
        return { id: 1, label: 'Yesterday' };
    }
    if (dayDiff < 7) {
        return { id: 2, label: `${dayDiff} days ago` };
    }
    if (dayDiff < 30) {
        return { id: 3, label: `${Math.floor(dayDiff / 7)} weeks ago` };
    }
    if (dayDiff < 365) {
        return { id: 4, label: `${Math.floor(dayDiff / 30)} months ago` };
    }
    return { id: 5, label: `${Math.floor(dayDiff / 365)} years ago` };
};

const groupSpecificationsByDate = (
    specifications: Specification[]
): Record<string, Specification[]> => {
    const labeledSpecs = specifications.map((spec) => ({
        spec: spec,
        data: getReadableDate(new Date(spec.createdAt)),
    }));

    const sortedSpecs = labeledSpecs.sort((a, b) => b.spec.id - a.spec.id);

    return sortedSpecs.reduce(
        (acc, item) => {
            const label = item.data.label;
            if (!acc[label]) {
                acc[label] = [];
            }
            acc[label].push(item.spec);
            return acc;
        },
        {} as Record<string, Specification[]>
    );
};

interface VersionListProps {
    view: OpenAPIVersionView;
    updateSpecs: () => void;
}

const VersionListComponent: React.FC<VersionListProps> = ({
    view,
    updateSpecs,
}) => {
    const {
        specs,
        setPreviewMode,
        setCurrentSpec,
        selectedSpecs,
        setSelectedSpecs,
        setDiffMode,
        openGroups,
        setOpenGroups,
        setRestored,
    } = useSpecificationContext();

    const handleToggleGroup = (dateGroup: string): void => {
        setOpenGroups((prev) => ({
            ...prev,
            [dateGroup]: !prev[dateGroup],
        }));
    };

    const handlePreview = (spec: Specification): void => {
        setCurrentSpec(spec);
        setPreviewMode(true);
    };

    const handleDeletePermanently = async (
        spec: Specification
    ): Promise<void> => {
        await view.controller.deleteVersionPermanently(spec.id);
        updateSpecs();
    };

    const handleRestoreTo = async (spec: Specification): Promise<void> => {
        const diff = spec.getPatchedVersion(specs).diff as string;
        if (view.file) {
            const content =
                view.file.extension === 'json'
                    ? JSON.stringify(diff)
                    : jsyaml.dump(JSON.parse(diff));
            await view.app.vault.adapter.write(view.file.path, content);
            view.plugin.publisher.publish({
                eventID: EventID.UpdateOpenAPIViewState,
                timestamp: new Date(),
                emitter: view.app.workspace,
                data: {
                    file: view.file.path,
                },
            } as UpdateOpenAPIViewStateEvent);
            view.plugin.showNotice(
                `The file ${view.file.path} has been restored to version ${spec.version}`
            );
            setRestored(spec);
        }
    };

    const handleSelectForDiff = async (spec: Specification): Promise<void> => {
        if (selectedSpecs.includes(spec)) {
            setSelectedSpecs(selectedSpecs.filter((s) => s !== spec));
            if (selectedSpecs.length === 1) {
                setDiffMode(false);
            }
        } else {
            if (selectedSpecs.length === 1) {
                setSelectedSpecs([...selectedSpecs, spec]);
                setDiffMode(true);
            } else {
                setSelectedSpecs([spec]);
            }
        }
    };

    const handleExportOneVersion = async (
        spec: Specification
    ): Promise<void> => {
        const data = {
            spec: spec,
            specs: specs,
        };
        await view.plugin.export.export(data);
        view.plugin.showNotice('Exported successfully');
    };

    const groupedSpecs = groupSpecificationsByDate(specs);

    return (
        <div>
            {Object.entries(groupedSpecs).map(([dateGroup, groupSpecs]) => (
                <div key={dateGroup}>
                    <GroupTitle
                        $isOpen={openGroups[dateGroup]}
                        onClick={() => handleToggleGroup(dateGroup)}
                    >
                        {dateGroup}
                    </GroupTitle>
                    {openGroups[dateGroup] &&
                        groupSpecs.map((spec) => (
                            <Card
                                key={spec.id}
                                $softDeleted={spec.softDeleted}
                                style={{
                                    border: selectedSpecs.includes(spec)
                                        ? '2px solid #007BFF'
                                        : 'none',
                                }}
                            >
                                <Title>{spec.name}</Title>
                                <Details>
                                    <Version>Version: {spec.version}</Version>
                                    <CreatedAt>
                                        Created:{' '}
                                        {new Date(
                                            spec.createdAt
                                        ).toLocaleString()}
                                    </CreatedAt>
                                </Details>
                                <ButtonGroup>
                                    {!spec.softDeleted ? (
                                        <>
                                            <PreviewButton
                                                onClick={() =>
                                                    handlePreview(spec)
                                                }
                                            >
                                                <FaEye /> Preview
                                            </PreviewButton>
                                            <RestoreButton
                                                onClick={() =>
                                                    handleRestoreTo(spec)
                                                }
                                            >
                                                <FaCalendarAlt
                                                    style={{
                                                        color: 'var(--icon-color)',
                                                    }}
                                                />
                                                Restore to...
                                            </RestoreButton>
                                            <DiffButton
                                                onClick={() =>
                                                    handleSelectForDiff(spec)
                                                }
                                            >
                                                <FaCodeBranch /> Diff
                                            </DiffButton>
                                            <DeleteButton
                                                onClick={async () => {
                                                    await view.controller.deleteVersion(
                                                        spec.id
                                                    );
                                                    spec.softDeleted = true;
                                                    updateSpecs();
                                                }}
                                            >
                                                <FaTrash /> Delete
                                            </DeleteButton>
                                            <ExportButton
                                                onClick={async () =>
                                                    await handleExportOneVersion(
                                                        spec
                                                    )
                                                }
                                            >
                                                <FaDownload /> Export
                                            </ExportButton>
                                        </>
                                    ) : (
                                        <>
                                            <RestoreButton
                                                onClick={async () => {
                                                    await view.controller.restoreVersion(
                                                        spec.id
                                                    );
                                                    spec.softDeleted = false;
                                                    updateSpecs();
                                                }}
                                            >
                                                <FaUndo /> Restore
                                            </RestoreButton>
                                            <DeletePermanentlyButton
                                                onClick={async () => {
                                                    await handleDeletePermanently(
                                                        spec
                                                    );
                                                }}
                                            >
                                                <FaTrashAlt /> Delete
                                                Permanently
                                            </DeletePermanentlyButton>
                                        </>
                                    )}
                                </ButtonGroup>
                            </Card>
                        ))}
                </div>
            ))}
        </div>
    );
};

export default VersionListComponent;
