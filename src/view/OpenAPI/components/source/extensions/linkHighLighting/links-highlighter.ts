import {
    Decoration,
    DecorationSet,
    EditorView,
    ViewPlugin,
    ViewUpdate,
    WidgetType,
} from '@codemirror/view';
import {
    Extension,
    RangeSetBuilder,
    StateEffect,
    StateField,
} from '@codemirror/state';

const linkRegex = /https?:\/\/[^\s"'()<>]+/g;
const linkMark = Decoration.mark({
    attributes: {
        'data-link': 'true',
        class: 'cm-link',
    },
});

const addWidgetEffect = StateEffect.define<{
    pos: number;
    url: string;
}>();

class LinkWidget extends WidgetType {
    dom!: HTMLElement;

    constructor(private url: string) {
        super();
    }

    toDOM(view: EditorView): HTMLElement {
        const dom = document.createElement('div');
        this.dom = dom;
        dom.addClass('cm-confirm-link-widget');

        const question = dom.createEl('div');
        question.textContent = `Would you like to follow the link?`;

        const confirmButton = dom.createEl('button', { text: 'Open' });
        confirmButton.onclick = (): void => {
            window.open(this.url, '_blank');
            this.removeWidget(view);
        };

        const cancelButton = dom.createEl('button', { text: 'Close' });
        cancelButton.onclick = (): void => this.removeWidget(view);

        return dom;
    }

    removeWidget(view: EditorView): void {
        view.dispatch({});
    }
}

const widgetField = StateField.define<DecorationSet>({
    create() {
        return Decoration.none;
    },
    update(decorations, transaction) {
        decorations = decorations.update({
            filter: (_, __, decoration) => !decoration.spec.widget,
        });

        for (const effect of transaction.effects) {
            if (effect.is(addWidgetEffect)) {
                const { pos, url } = effect.value;

                const widget = Decoration.widget({
                    widget: new LinkWidget(url),
                    side: 1,
                });
                decorations = decorations.update({
                    add: [widget.range(pos)],
                });
            }
        }

        return decorations;
    },
    provide: (field) => EditorView.decorations.from(field),
});

function updateLinks(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    const { from, to } = view.viewport;
    const text = view.state.sliceDoc(from, to);

    const matches = Array.from(text.matchAll(linkRegex));

    for (const match of matches) {
        const start = from + match.index;
        const end = start + match[0].length;
        builder.add(start, end, linkMark);
    }

    return builder.finish();
}

const linkHighlighter = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;

        constructor(view: EditorView) {
            this.decorations = updateLinks(view);
        }

        update(update: ViewUpdate): void {
            if (
                update.docChanged ||
                update.viewportChanged ||
                update.geometryChanged
            ) {
                this.decorations = updateLinks(update.view);
            }
        }
    },
    {
        decorations: (v) => v.decorations,
        eventHandlers: {
            mousedown: (e: MouseEvent, view: EditorView) => {
                const target = e.target as HTMLElement;
                const linkElement = target.closest('.cm-link');
                if (linkElement) {
                    e.preventDefault();
                    const pos = view.posAtCoords({
                        x: e.clientX,
                        y: e.clientY,
                    });
                    if (!pos) {
                        return;
                    }
                    view.dispatch({
                        effects: addWidgetEffect.of({
                            pos: pos,
                            url: linkElement.textContent ?? '',
                        }),
                    });
                }
            },
        },
    }
);

export const linkHighlightExtension: Extension = [linkHighlighter, widgetField];
