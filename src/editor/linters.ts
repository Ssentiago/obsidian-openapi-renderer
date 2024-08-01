import { Extension } from '@codemirror/state';
import { Diagnostic, linter } from '@codemirror/lint';
import { EditorView } from '@codemirror/view';
import jsyaml from 'js-yaml';

export function yamlLinter(): { extension: Extension } | readonly Extension[] {
    return linter((view: EditorView) => {
        const diagnostics: Diagnostic[] = [];
        const text = view.state.doc.toString();
        const cursorPos = view.state.doc.lineAt(view.state.selection.main.head);

        try {
            jsyaml.loadAll(text);
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
                    message: `Possible error at line ${cursorPos.number}. Please check the syntax near this location.`,
                });
            }
        }
        return diagnostics;
    });
}

export function jsonLinter(): { extension: Extension } | readonly Extension[] {
    return linter((view: EditorView) => {
        const diagnostics: Diagnostic[] = [];
        const text = view.state.doc.toString();
        const cursorPos = view.state.doc.lineAt(view.state.selection.main.head);

        try {
            JSON.parse(text);
        } catch (e: any) {
            const regex = new RegExp(
                /\(line (?<line>\d+) column (?<column>\d+)\)/
            );
            const match = regex.exec(e.message);
            if (match?.groups) {
                const { line } = match.groups;
                const errlineInfo = view.state.doc.line(parseInt(line, 10));

                diagnostics.push({
                    from: errlineInfo.from,
                    to: errlineInfo.to,
                    severity: 'error',
                    message: e.message,
                });

                if (errlineInfo.number === cursorPos.number) {
                    return diagnostics;
                }
                diagnostics.push({
                    from: cursorPos.from,
                    to: cursorPos.to,
                    severity: 'error',
                    message: `Possible error at line ${cursorPos.number}. Please check the syntax near this location.`,
                });
            }
        }
        return diagnostics;
    });
}
