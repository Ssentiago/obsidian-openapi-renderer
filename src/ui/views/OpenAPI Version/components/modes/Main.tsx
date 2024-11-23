import { EventID } from 'events-management/typing/constants';
import { ReloadOpenAPIEntryStateEvent } from 'events-management/typing/interfaces';
import { Specification } from 'indexedDB/database/specification';
import React, { useEffect } from 'react';
import { useSpecificationContext } from 'ui/views/OpenAPI Version/components/core/context';
import Diff from 'ui/views/OpenAPI Version/components/modes/diff/Diff';
import Normal from 'ui/views/OpenAPI Version/components/modes/normal/Normal';
import Preview from 'ui/views/OpenAPI Version/components/modes/preview/Preview';
import { VersionView } from 'ui/views/OpenAPI Version/version-view';

const Main: React.FC<{
    specifications: Specification[];
    view: VersionView;
}> = ({ specifications, view }) => {
    const {
        mode,
        specs,
        setSpecs,
        currentSpec,
        selectedSpecs,
        handleBackToList,
    } = useSpecificationContext();

    useEffect(() => {
        view.plugin.publisher.publish({
            eventID: EventID.ReloadOpenAPIEntryState,
            emitter: view.app.workspace,
            timestamp: new Date(),
        } as ReloadOpenAPIEntryStateEvent);
    }, [specs]);

    useEffect(() => {
        setSpecs(specifications);
    }, [specifications]);

    useEffect(() => {
        const handleBackButton = (event: MouseEvent): void => {
            if (event.button === 3) {
                handleBackToList();
            }
        };

        document.addEventListener('mouseup', handleBackButton);

        return (): void => {
            document.removeEventListener('mouseup', handleBackButton);
        };
    }, [view]);

    const handlePreviewData = (spec: Specification | string): string => {
        if (spec instanceof Specification) {
            return spec.getPatchedVersion(specs).diff as string;
        }
        return spec;
    };

    if (mode === 'Preview' && currentSpec) {
        return <Preview view={view} data={handlePreviewData(currentSpec)} />;
    }

    if (mode === 'Diff' && selectedSpecs.length === 2) {
        return (
            <Diff
                leftSpec={selectedSpecs[0].getPatchedVersion(specs)}
                rightSpec={selectedSpecs[1].getPatchedVersion(specs)}
                view={view}
            />
        );
    }

    return <Normal view={view} />;
};

export default Main;
