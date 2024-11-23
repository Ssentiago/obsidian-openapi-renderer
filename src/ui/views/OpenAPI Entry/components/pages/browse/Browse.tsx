import React from 'react';
import { useEntryContext } from 'ui/views/OpenAPI Entry/components/core/context';
import GridView from 'ui/views/OpenAPI Entry/components/pages/browse/components/grid-view/GridView';
import NoTrackedFilesFound from 'ui/views/OpenAPI Entry/components/pages/browse/components/no-tracked-files/NoTrackedFilesMessage';

const Browse: React.FC = () => {
    const { specData } = useEntryContext();

    return Object.entries(specData).length === 0 ? (
        <NoTrackedFilesFound />
    ) : (
        <GridView />
    );
};

export default Browse;
