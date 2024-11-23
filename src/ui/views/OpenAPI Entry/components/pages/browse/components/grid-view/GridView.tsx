import React from 'react';
import { useEntryContext } from 'ui/views/OpenAPI Entry/components/core/context';
import { GridItem } from 'ui/views/OpenAPI Entry/components/pages/browse/components/grid-view/components/grid-item/GridItem';
import { GridContainer } from 'ui/views/OpenAPI Entry/components/pages/browse/components/grid-view/styled/styled';

const GridView: React.FC<{}> = () => {
    const { specData, view } = useEntryContext();

    return (
        <GridContainer columns={4} gap={'20px'}>
            {Object.entries(specData).map(([path, entry]) => (
                <GridItem
                    key={path}
                    path={path}
                    view={view}
                    count={entry.count}
                    lastUpdate={entry.lastUpdate}
                />
            ))}
        </GridContainer>
    );
};

export default GridView;
