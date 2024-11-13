import { EditorView } from '@codemirror/view';
import { Notice } from 'obsidian';
import { OpenAPISource } from 'view/views/OpenAPI/components/source/openapi-source';
import { OpenAPIView } from 'view/views/OpenAPI/openapi-view';

export function handleScroll(editorView: OpenAPISource, event: Event): void {
    const groupedLeaves = editorView.plugin.app.workspace.getGroupLeaves(
        'openapi-renderer-view-group'
    );
    const target = event.target as HTMLElement;

    const { scrollTop: top, scrollLeft: left } = target;

    const scrollAxis = target.hasClass('view-content') ? 'top' : 'left';

    for (const leaf of groupedLeaves) {
        if (leaf === editorView.view.leaf) {
            continue;
        }
        const view = leaf.view as OpenAPIView;

        if (view.mode === 'preview') {
            continue;
        }
        if (scrollAxis === 'top') {
            view.contentEl.scrollTop = top;
        } else if (view.source.editor) {
            view.source.editor.scrollDOM.scrollLeft = left;
        }
    }
}

let fontSize = 16;

export function handleChangeFontSizeOnWHeel() {
    let timeout: NodeJS.Timeout | null = null;
    let notice: HTMLElement | undefined;
    return function (event: WheelEvent, view: EditorView): void {
        if (event.ctrlKey) {
            const delta = event.deltaY > 0 ? -1 : 1;
            fontSize = Math.min(Math.max(10, fontSize + delta), 20);
            view.dom.style.fontSize = `${fontSize}px`;
            if (notice) {
                notice.textContent = `Font size: ${fontSize}`;
            } else {
                notice = new Notice(`Font size: ${fontSize}`, 0).noticeEl;
            }
            if (timeout) {
                clearTimeout(timeout);
            }

            timeout = setTimeout(() => {
                timeout = null;
                notice?.remove();
                notice = undefined;
            }, 2000);
        }
    };
}
