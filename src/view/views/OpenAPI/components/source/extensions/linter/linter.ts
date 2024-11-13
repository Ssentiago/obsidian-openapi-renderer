import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { Diagnostic, linter } from '@codemirror/lint';
import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import jsyaml from 'js-yaml';

export function Linter(): { extension: Extension } | readonly Extension[] {
    return linter((view: EditorView) => {
        const diagnostics: Diagnostic[] = [];
        const text = view.state.doc.toString();
        const cursorPos = view.state.doc.lineAt(view.state.selection.main.head);
        try {
            jsyaml.load(text);
        } catch (e) {
            if (e instanceof jsyaml.YAMLException) {
                const mark = e.mark;
                const errLine = view.state.doc.line(mark.line + 1);
                const from = errLine.from + mark.column;
                const to = errLine.to;

                diagnostics.push({
                    from,
                    to,
                    severity: 'error',
                    message: e.message,
                });

                if (errLine.number === cursorPos.number) {
                    return diagnostics;
                }
                diagnostics.push({
                    from: cursorPos.from,
                    to: cursorPos.to,
                    severity: 'error',
                    message: `Possible error at line ${cursorPos.number}. Please check near this location.`,
                });
            }
        }
        return diagnostics;
    });
}

export const yamlJsonLinter: Extension[] = [yaml(), json(), Linter()];
