import React from 'react';
import { OpenAPIEntryView } from '../../OpenAPI-entry-view';
import { useEntryContext } from '../core/context';
import { GridContainer } from './grid-container-styled-component';
import { GridItemComponent } from './grid-item-component';

const GridContainerComponent: React.FC<{
    view: OpenAPIEntryView;
}> = ({ view }) => {
    const { columnValue, setColumnValue, specData } = useEntryContext();

    return (
        <>
            <GridContainer columns={columnValue} gap={'20px'}>
                {Object.entries(specData).map(([path, entry]) => (
                    <GridItemComponent
                        key={path}
                        path={path}
                        view={view}
                        title={path}
                        count={entry.count}
                        lastUpdate={entry.lastUpdate}
                    />
                ))}
            </GridContainer>
        </>
    );
};

export default GridContainerComponent;
