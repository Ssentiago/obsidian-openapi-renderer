import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { Diagnostic, linter } from '@codemirror/lint';
import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import jsyaml from 'js-yaml';

import { validateOpenApiSpec } from './openapi-validator';

/**
 * Lints the source document as both YAML/JSON syntax and an OpenAPI
 * specification.
 *
 * Syntax problems are reported first: a document that does not parse cannot be
 * checked meaningfully as a spec. Once it parses, the parsed value is validated
 * as an OpenAPI document so structural problems beyond bare syntax (a missing
 * info block, an operation without responses, a dangling $ref) reach the editor
 * gutter as well.
 */
export function Linter(): { extension: Extension } | readonly Extension[] {
    return linter((view: EditorView) => {
        const text = view.state.doc.toString();

        try {
            const spec = jsyaml.load(text);
            return validateOpenApiSpec(text, spec);
        } catch (e) {
            if (e instanceof jsyaml.YAMLException) {
                const mark = e.mark;
                const errLine = view.state.doc.line(mark.line + 1);
                const from = errLine.from + mark.column;
                const to = errLine.to;

                const diagnostics: Diagnostic[] = [
                    {
                        from,
                        to,
                        severity: 'error',
                        message: e.message,
                    },
                ];
                return diagnostics;
            }
            return [];
        }
    });
}

export const yamlJsonLinter: Extension[] = [yaml(), json(), Linter()];
