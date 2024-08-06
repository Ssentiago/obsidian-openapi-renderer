import {
    autocompletion,
    CompletionContext,
    CompletionResult,
} from '@codemirror/autocomplete';
import { yamlLanguage } from '@codemirror/lang-yaml';
import {
    Completion,
    completionMap,
    methodCompletionLabels,
    operationCompletionLabels,
    prepareCompletion,
    responseCompletionLabels,
    rootCompletionLabels,
} from './completion-labels';
import { SelectionRange } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';
import { jsonLanguage } from '@codemirror/lang-json';
import { SyntaxNode } from '@lezer/common';

type ParentTreeGetter = (context: CompletionContext) => string[] | undefined;

function getCompletion(
    currentWord: SelectionRange,
    options: Completion[]
): {
    from: number;
    to: number;
    options: Completion[];
} {
    return {
        from: currentWord.from,
        to: currentWord.to,
        options: options,
    };
}

function getYAMLParentTree(context: CompletionContext): string[] | undefined {
    const tree = syntaxTree(context.state);
    let currentNode: SyntaxNode | null = tree.resolveInner(context.pos, -1);
    if (['BlockLiteralContent', 'Comment'].includes(currentNode.name)) {
        return undefined;
    }

    const parentTree: string[] = [];
    while (currentNode) {
        if (currentNode.name === 'Pair') {
            const keyNode = currentNode.getChild('Key');
            if (keyNode) {
                parentTree.push(
                    context.state.sliceDoc(keyNode.from, keyNode.to)
                );
            }
        }
        currentNode = currentNode.parent;
    }
    return parentTree;
}

function getJSONParentTree(context: CompletionContext): string[] {
    const tree = syntaxTree(context.state);
    let currentNode: SyntaxNode | null = tree.resolveInner(context.pos, -1);
    const parentTree: string[] = [];
    currentNode.nextSibling;
    while (currentNode) {
        if (currentNode.name === 'Property') {
            const prop = context.state
                .sliceDoc(currentNode.from, currentNode.to)
                .match(/^"(\w+)"/);
            if (prop) {
                const key = prop[1];
                parentTree.push(key);
            }
        }
        currentNode = currentNode.parent;
    }
    parentTree.shift();
    return parentTree;
}

function openAPIAutocompletion(
    parentTreeGetter: ParentTreeGetter
): (context: CompletionContext) => CompletionResult | null {
    return function (context: CompletionContext): CompletionResult | null {
        const currentWord = context.state.wordAt(context.pos);
        if (!currentWord) {
            return null;
        }
        const parentTree = parentTreeGetter(context);
        if (parentTree === undefined) {
            return null;
        }
        parentTree.remove(
            context.state.sliceDoc(currentWord.from, currentWord.to)
        );
        const [parent, grandParent] = [parentTree[0], parentTree[1]];
        if (!parent) {
            return getCompletion(
                currentWord,
                prepareCompletion(rootCompletionLabels)
            );
        }
        if (grandParent === 'paths') {
            return getCompletion(
                currentWord,
                prepareCompletion(methodCompletionLabels)
            );
        }
        if (grandParent === 'responses') {
            return getCompletion(
                currentWord,
                prepareCompletion(responseCompletionLabels)
            );
        }
        if (methodCompletionLabels.includes(parent)) {
            return getCompletion(
                currentWord,
                prepareCompletion(operationCompletionLabels)
            );
        }
        const completion = completionMap.get(parent);
        return (completion && getCompletion(currentWord, completion)) ?? null;
    };
}

export const OpenAPICompletionExtension = [
    yamlLanguage.data.of({
        autocomplete: openAPIAutocompletion(getYAMLParentTree),
    }),
    jsonLanguage.data.of({
        autocomplete: openAPIAutocompletion(getJSONParentTree),
    }),
    autocompletion(),
];
