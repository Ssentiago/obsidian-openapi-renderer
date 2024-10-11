import { Extension, RangeSetBuilder } from '@codemirror/state';
import {
    Decoration,
    DecorationSet,
    EditorView,
    ViewPlugin,
    ViewUpdate,
} from '@codemirror/view';

const linkRegex =
    /((https?:\/\/)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;
const linkMark = Decoration.mark({
    attributes: {
        'data-link': 'true',
        class: 'cm-link',
    },
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

        constructor(public view: EditorView) {
            this.decorations = updateLinks(view);
            view.dom.addEventListener(
                'mouseover',
                this.handleMouseMove.bind(this)
            );
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

        handleMouseMove(event: MouseEvent): void {
            const target = event.target as HTMLElement;
            const linkElement = target.closest('.cm-link');

            if (linkElement) {
                if (event.ctrlKey) {
                    target.style.cursor = 'pointer';
                    target.ariaLabel = 'Open link';
                } else {
                    target.style.cursor = 'default';
                    target.ariaLabel = 'Ctrl + click to open link';
                }
            } else {
                target.style.cursor = 'default';
            }
        }

        destroy(): void {
            this.view.dom.removeEventListener(
                'mousemove',
                this.handleMouseMove
            );
        }
    },

    {
        decorations: (v) => v.decorations,
        eventHandlers: {
            mousedown: (e: MouseEvent) => {
                const target = e.target as HTMLElement;
                if (target.style.cursor !== 'pointer') {
                    return;
                }
                const linkElement = target.closest('.cm-link');
                if (linkElement) {
                    e.preventDefault();
                    if (linkElement.textContent) {
                        let url = linkElement.textContent;
                        if (url.startsWith('www.')) {
                            url = `https://${url}`;
                        }
                        window.open(url, '_blank');
                    }
                }
            },
        },
    }
);

export const linkHighlightExtension: Extension = [
    linkHighlighter,
    EditorView.baseTheme({
        '&light [data-link="true"], &light [data-link="true"] > span': {
            color: '#0056b3',
            textDecoration: 'underline',
            cursor: 'pointer',
        },
        '&dark [data-link="true"], &dark [data-link="true"] > span': {
            color: '#79b7ff',
            textDecoration: 'underline',
            cursor: 'pointer',
        },
    }),
];
