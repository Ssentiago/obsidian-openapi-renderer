import { Extension, RangeSetBuilder } from '@codemirror/state';
import {
    Decoration,
    DecorationSet,
    EditorView,
    ViewPlugin,
    ViewUpdate,
} from '@codemirror/view';
import { TFile } from 'obsidian';
import { OPENAPI_VIEW } from 'ui/typing/types';
import type { OpenAPISource } from 'ui/views/OpenAPI/components/source/openapi-source';
import type { OpenAPIView } from 'ui/views/OpenAPI/openapi-view';

/**
 * Matches an OpenAPI `$ref` entry and captures its value. Both YAML
 * (`$ref: './pet.yaml#/Pet'`) and JSON (`"$ref": "#/components/schemas/Pet"`)
 * spellings are covered, quoted and bare scalars alike.
 */
const refRegex = /["']?\$ref["']?\s*:\s*(?:["']([^"'\n]+)["']|([^\s[\]{},]+))/g;

const refMark = (value: string): Decoration =>
    Decoration.mark({
        class: 'cm-ref',
        attributes: { 'data-ref': value },
    });

/**
 * Builds the decoration set covering every `$ref` value in the viewport. The
 * value string is stored on the element so a click can read it back without
 * re-resolving the document position.
 */
function updateRefs(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    const { from, to } = view.viewport;
    const text = view.state.sliceDoc(from, to);

    for (const match of text.matchAll(refRegex)) {
        const value = match[1] || match[2];
        if (!value) {
            continue;
        }
        const offset = match[0].lastIndexOf(value);
        const start = from + match.index + offset;
        builder.add(start, start + value.length, refMark(value));
    }

    return builder.finish();
}

/**
 * Splits a `$ref` value into its file part and its JSON pointer. A value
 * without a `#` points at a whole document; one starting with `#` points inside
 * the current document.
 */
function parseRef(ref: string): { filePath: string; pointer: string } {
    const hash = ref.indexOf('#');
    if (hash === -1) {
        return { filePath: ref, pointer: '' };
    }
    return { filePath: ref.slice(0, hash), pointer: ref.slice(hash + 1) };
}

/**
 * Decodes a JSON pointer body (the part after `#`) into path segments, undoing
 * the `~1` and `~0` escapes and any percent encoding.
 */
function pointerSegments(pointer: string): string[] {
    if (!pointer || pointer === '/') {
        return [];
    }
    return pointer
        .split('/')
        .slice(1)
        .map((segment) =>
            decodeURIComponent(segment).replace(/~1/g, '/').replace(/~0/g, '~')
        );
}

/**
 * Extracts the mapping key introduced by a source line, or `null` when the line
 * is not a mapping entry (a plain scalar, a brace, a comment). A leading YAML
 * sequence marker is stripped first so `- name: id` reports the key `name`.
 */
function extractMappingKey(line: string): string | null {
    const sequence = line.match(/^\s*-\s+(.*)$/);
    const body = sequence ? sequence[1] : line.replace(/^\s+/, '');

    const match = body.match(
        /^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^:\s][^:]*?)\s*:(?=\s|$|"|{|\[)/
    );
    if (!match) {
        return null;
    }

    let key = match[1];
    if (
        (key.startsWith('"') && key.endsWith('"')) ||
        (key.startsWith("'") && key.endsWith("'"))
    ) {
        key = key.slice(1, -1);
    }
    return key.trim();
}

/**
 * Reports whether a key path reaches the given JSON pointer segments. Every
 * segment except the last must map to a key in order; a plain number that finds
 * no key is treated as an array index and skipped, so a pointer can address into
 * a sequence without the scanner modelling sequence levels. The final segment
 * must always match a real key, so a pointer such as `.../responses/200` lands
 * on the `200` entry rather than its `responses` parent.
 */
function matches(keyPath: string[], segments: string[]): boolean {
    let index = 0;
    for (let position = 0; position < segments.length; position += 1) {
        const segment = segments[position];
        const isLast = position === segments.length - 1;
        if (index < keyPath.length && keyPath[index] === segment) {
            index += 1;
            continue;
        }
        if (!isLast && /^\d+$/.test(segment)) {
            continue;
        }
        return false;
    }
    return index === keyPath.length;
}

/**
 * Resolves a JSON pointer to a character offset in the source text. The text is
 * scanned line by line tracking the nesting of mapping keys by indentation,
 * which holds for YAML and for pretty printed JSON alike. The offset returned is
 * the start of the target key line. When the pointer has no exact target the
 * deepest matching ancestor is used, and `null` only when nothing matches.
 */
export function findPointerTarget(
    text: string,
    segments: string[]
): number | null {
    if (segments.length === 0) {
        return 0;
    }

    const lines = text.split('\n');
    const lineStarts: number[] = [];
    let running = 0;
    for (const line of lines) {
        lineStarts.push(running);
        running += line.length + 1;
    }

    const stack: { indent: number; key: string }[] = [];
    let fallback: number | null = null;
    let fallbackDepth = 0;

    for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i];
        if (!line.trim()) {
            continue;
        }
        const indent = line.match(/^\s*/)?.[0].length ?? 0;
        const key = extractMappingKey(line);
        if (key === null) {
            continue;
        }

        while (stack.length && stack[stack.length - 1].indent >= indent) {
            stack.pop();
        }

        const keyPath = stack.map((entry) => entry.key).concat(key);
        const offset = lineStarts[i] + indent;

        if (matches(keyPath, segments)) {
            return offset;
        }

        const depth = keyPath.length;
        if (
            depth <= segments.length &&
            depth > fallbackDepth &&
            matches(keyPath, segments.slice(0, depth))
        ) {
            fallback = offset;
            fallbackDepth = depth;
        }

        stack.push({ indent, key });
    }

    return fallback;
}

/**
 * Resolves a referenced file path against the folder of the current file and
 * returns a normalized vault path. Remote URLs resolve to `null` because they
 * are not vault files.
 */
export function resolveVaultPath(
    currentFilePath: string,
    refPath: string
): string | null {
    if (/^[a-z][a-z0-9+.-]*:/i.test(refPath)) {
        return null;
    }
    const slash = currentFilePath.lastIndexOf('/');
    const dir = slash === -1 ? '' : currentFilePath.slice(0, slash);
    const joined = refPath.startsWith('/')
        ? refPath.slice(1)
        : dir
          ? `${dir}/${refPath}`
          : refPath;

    const stack: string[] = [];
    for (const part of joined.split('/')) {
        if (part === '' || part === '.') {
            continue;
        }
        if (part === '..') {
            stack.pop();
            continue;
        }
        stack.push(part);
    }
    return stack.join('/');
}

function scrollToOffset(editor: EditorView, offset: number): void {
    editor.dispatch({
        selection: { anchor: offset, head: offset },
        scrollIntoView: true,
    });
    editor.focus();
}

/**
 * Waits for the freshly opened view to expose its editor and then scrolls it to
 * the pointer target. The editor is created asynchronously when the view
 * renders, so the lookup is retried briefly and abandoned silently when it never
 * appears.
 */
async function scrollWhenReady(
    view: OpenAPIView,
    segments: string[],
    attemptsLeft = 20
): Promise<void> {
    const editor = view.source.editor;
    if (editor) {
        const target = findPointerTarget(editor.state.doc.toString(), segments);
        if (target !== null) {
            scrollToOffset(editor, target);
        }
        return;
    }
    if (attemptsLeft <= 0) {
        return;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 50));
    await scrollWhenReady(view, segments, attemptsLeft - 1);
}

/**
 * Navigates to the target of a `$ref` value. Internal pointers jump within the
 * current editor; references to another file open that file in a new view and
 * scroll to the pointer target once its editor is available.
 */
async function jumpToRef(source: OpenAPISource, ref: string): Promise<void> {
    const { filePath, pointer } = parseRef(ref);
    const segments = pointerSegments(pointer);

    if (!filePath) {
        const editor = source.editor;
        if (!editor) {
            return;
        }
        const target = findPointerTarget(editor.state.doc.toString(), segments);
        if (target === null) {
            source.plugin.showNotice(
                'Reference target not found in this document.'
            );
            return;
        }
        scrollToOffset(editor, target);
        return;
    }

    const targetPath = resolveVaultPath(source.view.file?.path ?? '', filePath);
    if (targetPath === null) {
        source.plugin.showNotice('Cannot navigate to a remote reference.');
        return;
    }

    const file = source.plugin.app.vault.getAbstractFileByPath(targetPath);
    if (!(file instanceof TFile)) {
        source.plugin.showNotice(
            `Reference target file not found: ${filePath}`
        );
        return;
    }

    const leaf = source.plugin.app.workspace.getLeaf('tab');
    await leaf.setViewState({
        type: OPENAPI_VIEW,
        active: true,
        state: { file: targetPath },
    });
    await source.plugin.app.workspace.revealLeaf(leaf);

    if (segments.length > 0) {
        void scrollWhenReady(leaf.view as OpenAPIView, segments);
    }
}

/**
 * Marks `$ref` values as navigable and wires Ctrl/Cmd click to jump to the
 * referenced definition.
 */
export function refNavigationExtension(source: OpenAPISource): Extension {
    const refHighlighter = ViewPlugin.fromClass(
        class {
            decorations: DecorationSet;

            constructor(view: EditorView) {
                this.decorations = updateRefs(view);
            }

            update(update: ViewUpdate): void {
                if (
                    update.docChanged ||
                    update.viewportChanged ||
                    update.geometryChanged
                ) {
                    this.decorations = updateRefs(update.view);
                }
            }
        },
        {
            decorations: (plugin) => plugin.decorations,
            eventHandlers: {
                mousedown(event: MouseEvent) {
                    if (!event.ctrlKey && !event.metaKey) {
                        return undefined;
                    }
                    const element = (event.target as HTMLElement).closest(
                        '.cm-ref'
                    );
                    const ref = element?.getAttribute('data-ref');
                    if (!ref) {
                        return undefined;
                    }
                    event.preventDefault();
                    void jumpToRef(source, ref);
                    return true;
                },
                mousemove(event: MouseEvent) {
                    const target = event.target as HTMLElement;
                    const element = target.closest('.cm-ref');
                    if (!element) {
                        return;
                    }
                    const navigable = event.ctrlKey || event.metaKey;
                    target.setCssProps({
                        cursor: navigable ? 'pointer' : 'default',
                    });
                    target.ariaLabel = navigable
                        ? 'Go to reference'
                        : 'Ctrl + click to go to reference';
                },
            },
        }
    );

    const refTheme = EditorView.baseTheme({
        '&light .cm-ref, &light .cm-ref > span': {
            color: '#0056b3',
            textDecoration: 'underline',
        },
        '&dark .cm-ref, &dark .cm-ref > span': {
            color: '#79b7ff',
            textDecoration: 'underline',
        },
    });

    return [refHighlighter, refTheme];
}
