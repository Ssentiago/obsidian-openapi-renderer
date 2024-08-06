import { EditorView } from '@codemirror/view';
import { App, TFile } from 'obsidian';

interface EditorPlugin {
    app: App;
    showNotice: (message: string) => void;
}

export interface CustomEditorView {
    file: TFile | null;
    editor: EditorView;
    plugin: EditorPlugin;
}
