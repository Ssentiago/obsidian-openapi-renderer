import { EventID } from 'events-management/typing/constants';
import { UpdateOpenAPIViewStateEvent } from 'events-management/typing/interfaces';
import { Specification } from 'indexedDB/database/specification';
import jsyaml from 'js-yaml';
import { Calendar, Download, Eye, GitBranch, Trash, Undo } from 'lucide-react';
import { moment } from 'obsidian';
import React, { useCallback, useEffect, useState } from 'react';
import { useSpecificationContext } from 'view/views/OpenAPI Version/components/core/context';
import { groupSpecificationsByDate } from 'view/views/OpenAPI Version/components/modes/normal/components/version-list/helpers/helpers';
import {
    CreatedAt,
    Details,
    GroupTitle,
    Version,
} from 'view/views/OpenAPI Version/components/modes/normal/components/version-list/styled/styled';
import { Card } from 'view/views/OpenAPI Version/components/modes/normal/styled/normalStyled';
import {
    Button,
    ButtonGroup,
    Title,
} from 'view/views/OpenAPI Version/components/modes/styled/common-styled';
import { VersionView } from 'view/views/OpenAPI Version/version-view';

const VersionList: React.FC<{
    view: VersionView;
    updateSpecs: () => void;
}> = ({ view, updateSpecs }) => {
    const {
        specs,
        setCurrentSpec,
        selectedSpecs,
        setSelectedSpecs,
        openGroups,
        setOpenGroups,
        setRestored,
        setMode,
    } = useSpecificationContext();

    const [groupedSpecs, setGroupedSpecs] = useState<
        Record<string, Specification[]>
    >({});

    useEffect(() => {
        setGroupedSpecs(groupSpecificationsByDate(specs));
    }, [specs]);

    const handleToggleGroup = useCallback(
        (dateGroup: string): void => {
            setOpenGroups((prev) => ({
                ...prev,
                [dateGroup]: !prev[dateGroup],
            }));
        },
        [setOpenGroups]
    );

    const handlePreview = useCallback(
        (spec: Specification): void => {
            setCurrentSpec(spec);
            setMode('Preview');
        },
        [setCurrentSpec, setMode]
    );

    const handleRestoreTo = useCallback(
        async (spec: Specification): Promise<void> => {
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
        },
        [view, specs, setRestored]
    );

    const handleSelectForDiff = useCallback(
        async (spec: Specification): Promise<void> => {
            setSelectedSpecs((prev) => {
                if (selectedSpecs.includes(spec)) {
                    const newSpecs = selectedSpecs.filter((s) => s !== spec);

                    if (selectedSpecs.length === 0) {
                        setMode('Normal');
                    }
                    return newSpecs;
                }

                if (prev.length === 1) {
                    setMode('Diff');
                    return [...prev, spec];
                }

                return [spec];
            });
        },
        [selectedSpecs, setSelectedSpecs, setMode]
    );

    const handleSoftDelete = useCallback(
        async (spec: Specification): Promise<void> => {
            await view.controller.versionController.deleteVersion(spec.id);
            spec.softDeleted = true;
            updateSpecs();
        },
        [view, updateSpecs]
    );

    const handleRestore = useCallback(
        async (spec: Specification): Promise<void> => {
            await view.controller.versionController.restoreVersion(spec.id);
            spec.softDeleted = false;
            updateSpecs();
        },
        [view, updateSpecs]
    );

    const handleDeletePermanently = useCallback(
        async (spec: Specification): Promise<void> => {
            await view.controller.versionController.deleteVersionPermanently(
                spec.id
            );
            updateSpecs();
        },
        [view, updateSpecs]
    );

    const handleExportOneVersion = useCallback(
        async (spec: Specification): Promise<void> => {
            await view.plugin.export.export({
                spec: spec,
                specs: specs,
            });
            view.plugin.showNotice('Exported successfully');
        },
        [view, specs]
    );

    return (
        <>
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
                                        ? '2px solid var(--interactive-accent)'
                                        : 'none',
                                }}
                            >
                                <Title>{spec.name}</Title>
                                <Details>
                                    <Version>Version: {spec.version}</Version>
                                    <CreatedAt>
                                        Created:{' '}
                                        {moment(spec.createdAt).toISOString()}
                                    </CreatedAt>
                                </Details>
                                <ButtonGroup>
                                    {!spec.softDeleted ? (
                                        <>
                                            <Button
                                                aria-label={`Preview of ${spec.name}`}
                                                onClick={() =>
                                                    handlePreview(spec)
                                                }
                                            >
                                                <Eye /> Preview
                                            </Button>
                                            <Button
                                                aria-label={`Restore ${spec.name} to...`}
                                                onClick={() =>
                                                    handleRestoreTo(spec)
                                                }
                                            >
                                                <Calendar />
                                                Restore to...
                                            </Button>
                                            <Button
                                                aria-label={`Select for diff ${spec.name}`}
                                                onClick={() =>
                                                    handleSelectForDiff(spec)
                                                }
                                            >
                                                <GitBranch /> Diff
                                            </Button>
                                            <Button
                                                aria-label={`Delete ${spec.name}`}
                                                onClick={async () =>
                                                    handleSoftDelete(spec)
                                                }
                                            >
                                                <Trash /> Delete
                                            </Button>
                                            <Button
                                                aria-label={`Export ${spec.name}`}
                                                onClick={async () =>
                                                    handleExportOneVersion(spec)
                                                }
                                            >
                                                <Download /> Export
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                aria-label={`Restore ${spec.name}`}
                                                onClick={async () =>
                                                    handleRestore(spec)
                                                }
                                            >
                                                <Undo /> Restore
                                            </Button>
                                            <Button
                                                aria-label={`Permanently delete ${spec.name}`}
                                                onClick={async () =>
                                                    handleDeletePermanently(
                                                        spec
                                                    )
                                                }
                                            >
                                                <Trash /> Delete Permanently
                                            </Button>
                                        </>
                                    )}
                                </ButtonGroup>
                            </Card>
                        ))}
                </div>
            ))}
        </>
    );
};

export default VersionList;
