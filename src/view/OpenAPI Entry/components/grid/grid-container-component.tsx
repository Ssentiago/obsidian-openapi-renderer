import React, { useEffect } from 'react';
import { useEntryContext } from '../core/context';
import { GridContainer } from './grid-container-styled-component';
import { GridItemComponent } from './grid-item-component';
import { OpenAPIEntryView } from '../../OpenAPI-entry-view';
import { eventID } from 'typing/constants';
import { ChangeGridColumnsStateEvent } from 'typing/interfaces';

const GridContainerComponent: React.FC<{
    view: OpenAPIEntryView;
}> = ({ view }) => {
    const { columnValue, setColumnValue, specData } = useEntryContext();

    useEffect(() => {
        view.plugin.observer.subscribe(
            view.app.workspace,
            eventID.ChangeGridColumnsState,
            async (event) => {
                const changeGridEvent = event as ChangeGridColumnsStateEvent;
                setColumnValue(changeGridEvent.data.value);
            }
        );
    }, []);
    return (
        <>
            <GridContainer columns={columnValue} gap={'20px'}>
                {specData.map((entry) => (
                    <GridItemComponent
                        key={entry.path}
                        view={view}
                        title={entry.path}
                        count={entry.versionCount}
                        lastUpdate={entry.lastUpdatedAt}
                    />
                ))}
            </GridContainer>
        </>
    );
};

export default GridContainerComponent;
