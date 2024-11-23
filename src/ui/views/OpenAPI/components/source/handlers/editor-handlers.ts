import { Annotation } from '@codemirror/state';
import { ViewUpdate } from '@codemirror/view';
import { EventID } from 'events-management/typing/constants';
import { SourceChangedEvent } from 'events-management/typing/interfaces';
import { OpenAPISource } from 'ui/views/OpenAPI/components/source/openapi-source';
import { OpenAPIView } from 'ui/views/OpenAPI/openapi-view';

const syncAnnotation = Annotation.define<boolean>();

export function onChange(source: OpenAPISource, update: ViewUpdate): void {
    const isSyncTr = update.transactions.some((tr) =>
        tr.annotation(syncAnnotation)
    );

    if (isSyncTr) {
        return;
    }

    document.dispatchEvent(
        new KeyboardEvent('keydown', {
            key: 's',
            code: 'KeyS',
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
            composed: true,
        })
    );

    const openApiGroupedLeaves = source.plugin.app.workspace.getGroupLeaves(
        'openapi-renderer-view-group'
    );

    source.view.setViewData(source.editor?.state.doc.toString() ?? '', false);

    for (const leaf of openApiGroupedLeaves) {
        const view = leaf.view as OpenAPIView;
        if (leaf !== source.view.leaf) {
            const editor = view.source.editor;

            editor?.dispatch({
                changes: update.changes,
                annotations: syncAnnotation.of(true),
            });

            view.setViewData(editor?.state.doc.toString() ?? '', false);
        }
        source.plugin.publisher.publish({
            eventID: EventID.EditorChanged,
            timestamp: new Date(),
            emitter: source.plugin.app.workspace,
            data: {
                file: view.file?.path ?? '',
            },
        } as SourceChangedEvent);
    }
}
