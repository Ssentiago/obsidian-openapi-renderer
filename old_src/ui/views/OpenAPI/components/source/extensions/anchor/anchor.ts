import {
    Extension,
    RangeSet,
    StateEffect,
    StateField,
} from '@codemirror/state';
import { EditorView, gutter, GutterMarker, ViewUpdate } from '@codemirror/view';
import { AnchorData } from 'indexedDB/database/anchor';
import { Menu, moment } from 'obsidian';
import { AdditionalDataModal } from 'ui/views/OpenAPI/components/source/extensions/anchor/modals/additional-data-modal';
import { OpenAPIView } from 'ui/views/OpenAPI/openapi-view';

const anchorEffect = StateEffect.define<{ pos: number; on: boolean }>({
    map: (val, mapping) => ({ pos: mapping.mapPos(val.pos), on: val.on }),
});

const anchorMarker = new (class extends GutterMarker {
    toDOM(): Text {
        return document.createTextNode('⚓');
    }
})();

const anchorGutter = function (view: OpenAPIView): Extension {
    const anchorState = StateField.define<RangeSet<GutterMarker>>({
        create() {
            let markers = RangeSet.empty;
            for (const anchor of view.anchors) {
                markers = markers.update({
                    add: [anchorMarker.range(anchor.pos)],
                });
            }

            return markers;
        },
        update(set, transaction) {
            set = set.map(transaction.changes);
            for (const e of transaction.effects) {
                if (e.is(anchorEffect)) {
                    if (e.value.on) {
                        set = set.update({
                            add: [anchorMarker.range(e.value.pos)],
                        });
                    } else {
                        set = set.update({
                            filter: (from) => from !== e.value.pos,
                        });
                    }
                }
            }
            return set;
        },
    });

    const hasAnchorAt = (editorView: EditorView, pos: number): boolean => {
        const anchors = editorView.state.field(anchorState);
        let hasAnchor = false;
        anchors.between(pos, pos, () => {
            hasAnchor = true;
        });
        return hasAnchor;
    };

    const copyLink = async (editorView: EditorView, line: number) => {
        const link = `obsidian://openapi-open?openapiPath=${view.file?.path}&line=${line}`;
        await navigator.clipboard.writeText(link);
        view.plugin.showNotice('Link copied to clipboard');
    };

    async function toggleAnchor(
        editorView: EditorView,
        pos: number,
        view: OpenAPIView,
        additionalData?: Partial<AnchorData>
    ): Promise<void> {
        const hasAnchor = hasAnchorAt(editorView, pos);

        const lineN = editorView.state.doc.lineAt(pos).number;

        const anchorData = {
            line: lineN,
            pos: pos,
            time: moment().unix(),
            label: additionalData?.label,
            comment: additionalData?.comment,
        };

        if (hasAnchor) {
            const filtered = Array.from(view.anchors).filter(
                (anchor) =>
                    anchor.line !== anchorData.line &&
                    anchor.pos !== anchorData.pos
            );
            view.anchors = new Set(filtered);
            await view.controller.deleteAnchor(anchorData);
        } else {
            view.anchors.add(anchorData);
            await view.controller.addAnchor(anchorData);
        }

        editorView.dispatch({
            effects: anchorEffect.of({ pos, on: !hasAnchor }),
        });
    }

    const anchorUpdater = EditorView.updateListener.of(
        async (update: ViewUpdate) => {
            if (update.docChanged) {
                const newAnchors = new Set<AnchorData>();
                const anchors = update.state.field(anchorState);

                const deletionPromises: Promise<boolean>[] = [];
                const additionPromises: Promise<boolean>[] = [];

                for (const anchor of view.anchors) {
                    const oldPos = anchor.pos;
                    const newPos = update.changes.mapPos(oldPos);

                    let hasAnchor = false;
                    anchors.between(newPos, newPos, () => {
                        hasAnchor = true;
                    });

                    if (!hasAnchor) {
                        view.anchors.delete(anchor);
                        deletionPromises.push(
                            view.controller.deleteAnchor(anchor)
                        );
                        continue;
                    }

                    if (oldPos !== newPos) {
                        view.anchors.delete(anchor);
                        deletionPromises.push(
                            view.controller.deleteAnchor(anchor)
                        );
                        const newLine = update.state.doc.lineAt(newPos);
                        newAnchors.add({
                            line: newLine.number,
                            pos: newPos,
                            time: anchor.time,
                        });
                    }
                }

                await Promise.all(deletionPromises);

                for (const anchor of newAnchors) {
                    view.anchors.add(anchor);
                    additionPromises.push(view.controller.addAnchor(anchor));
                }

                await Promise.all(additionPromises);
            }
        }
    );
    return [
        anchorState,
        anchorUpdater,
        gutter({
            class: 'cm-anchor-gutter',
            markers: (v) => v.state.field(anchorState),
            initialSpacer: () => anchorMarker,
            domEventHandlers: {
                mousedown(editorView, line, event) {
                    const e = event as MouseEvent;
                    if (e.button === 0) {
                        toggleAnchor(editorView, line.from, view);
                        return true;
                    }
                    return false;
                },
                contextmenu(editorView, line, event) {
                    const e = event as MouseEvent;

                    e.preventDefault();
                    const menu = new Menu();

                    const lineData = editorView.state.doc.lineAt(line.from);

                    const hasAnchor = hasAnchorAt(editorView, line.from);

                    if (hasAnchor) {
                        menu.addItem((item) => {
                            item.setTitle('Copy anchor link');
                            item.onClick(async () => {
                                await copyLink(editorView, lineData.number);
                            });
                        });
                    } else {
                        menu.addItem((item) => {
                            item.setTitle('Add anchor with additional data');
                            item.onClick(async () => {
                                new AdditionalDataModal(
                                    view.app,
                                    {
                                        line: lineData.number,
                                        string: lineData.text,
                                    },
                                    async (data) => {
                                        await toggleAnchor(
                                            editorView,
                                            lineData.from,
                                            view,
                                            data
                                        );
                                    }
                                ).open();
                            });
                        });
                    }

                    menu.showAtMouseEvent(e);

                    return true;
                },
            },
        }),
        EditorView.baseTheme({
            '.cm-anchor-gutter .cm-gutterElement': {
                color: 'var(--interactive-accent)',
                transition: 'color 0.3s ease, transform 0.2s ease',
                paddingLeft: '5px',
                cursor: 'default',
            },
        }),
    ];
};

export default anchorGutter;
