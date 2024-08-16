import React, { useEffect } from 'react';
import { OpenAPIEntryView } from '../../OpenAPI-entry-view';
import { useEntryContext } from '../core/context';
import { eventID } from '../../../../typing/constants';
import { ChangeGridColumnsStateEvent } from '../../../../typing/interfaces';

export const SettingsComponent: React.FC<{
    view: OpenAPIEntryView;
}> = ({ view }) => {
    const { columnValue, setColumnValue } = useEntryContext();
    setColumnValue(view.plugin.settings.OpenAPIEntryGridColumns);

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

    return null;
};
