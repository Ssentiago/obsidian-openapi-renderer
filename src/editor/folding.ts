import { foldGutter, foldService, syntaxTree } from '@codemirror/language';
import { SyntaxNode } from '@lezer/common';
import { EditorState } from '@codemirror/state';

function foldYaml(state: EditorState, line: number) {
    const tree = syntaxTree(state);
    const pos = state.doc.lineAt(line).from;
    const node = tree.resolve(pos, 1);
    if (!node) {
        return null;
    }

    let start = null;
    let end = null;

    function findFoldable(node: SyntaxNode): void {
        if (node.name === 'BlockMapping') {
            start = node.from;
            let sibling = node.nextSibling;
            while (sibling) {
                if (sibling.name === 'BlockMapping') {
                    end = sibling.from;
                    break;
                }
                sibling = sibling.nextSibling;
            }
        }
    }
    findFoldable(node);

    if (start && end) {
        return { from: start, to: end };
    }

    return null;
}

export const yamlJsonFoldingExtension = [
    foldService.of((state, line) => foldYaml(state, line)),
    foldGutter(),
];
