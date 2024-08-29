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

function ctrlHandler(target: HTMLElement) {
    return function inner(e: KeyboardEvent): void {
        if (e.key === 'Control') {
            target.style.cursor = '';
            target.title = '';
            window.removeEventListener('keyup', inner);
        }
    };
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
            mouseover: (e: MouseEvent, view: EditorView) => {
                const target = e.target as HTMLElement;
                if (target.hasClass('cm-link')) {
                    target.title = 'Ctrl + click to open link';
                    if (e.ctrlKey) {
                        target.style.cursor = 'pointer';
                        target.title = 'Open link';
                        window.addEventListener('keyup', ctrlHandler(target));
                    }
                }
            },
        },
    }
);

export const linkHighlightExtension: Extension = [linkHighlighter];
