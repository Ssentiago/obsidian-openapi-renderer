import React, { useEffect } from 'react';
import { useSpecificationContext } from 'view/views/OpenAPI Version/components/core/context';
import DraftVersion from 'view/views/OpenAPI Version/components/modes/normal/components/draft-version/DraftVersion';
import NoVersionsMessage from 'view/views/OpenAPI Version/components/modes/normal/components/no-version-available/no-versions-available';
import VersionList from 'view/views/OpenAPI Version/components/modes/normal/components/version-list/VersionList';
import { VersionView } from 'view/views/OpenAPI Version/version-view';

const Normal: React.FC<{
    view: VersionView;
}> = ({ view }) => {
    const { specs, setSpecs, handleBackToList } = useSpecificationContext();

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

    const updateSpecs = (): void => {
        const updatedSpecs = [...view.versions];
        setSpecs(updatedSpecs);
    };

    return (
        <div style={{ padding: '20px' }}>
            <DraftVersion updateSpecs={updateSpecs} />
            {specs.length === 0 ? (
                <NoVersionsMessage />
            ) : (
                <VersionList view={view} updateSpecs={updateSpecs} />
            )}
        </div>
    );
};

export default Normal;
