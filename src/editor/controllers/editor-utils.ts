import { SwaggerEditor } from '../OpenAPIEditorView';
import { jsonLinter, yamlLinter } from '../linters';
import { closeBrackets } from '@codemirror/autocomplete';
import {
    EditorView,
    highlightActiveLine,
    keymap,
    lineNumbers,
} from '@codemirror/view';
import {
    defaultHighlightStyle,
    indentOnInput,
    LanguageSupport,
    syntaxHighlighting,
} from '@codemirror/language';
import createBoundKeymap from '../keymap';
import { history } from '@codemirror/commands';
import { showMinimap } from '@replit/codemirror-minimap';
import { EditorState, Extension } from '@codemirror/state';
import { eventID } from '../../typing/constants';
import { darkTheme, lightTheme } from '../themes';
import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { setIcon } from 'obsidian';
import { EditorController } from './editor-controller';

const create = (v: EditorView) => {
    const dom = document.createElement('div');
    return { dom };
};

export class EditorUtils {
    constructor(private editor: SwaggerEditor) {}

    static createExtensions(
        controller: EditorController
    ): ({ extension: Extension } | readonly Extension[] | LanguageSupport)[] {
        const linter =
            controller.editor.file?.extension === 'json'
                ? jsonLinter
                : yamlLinter;
        return [
            controller.editor.controller.themeManager.themeConfigurator.of(
                controller.editor.currentTheme
            ),
            controller.editor.languageExtension(),
            closeBrackets(),
            linter(),
            highlightActiveLine(),
            syntaxHighlighting(defaultHighlightStyle),
            keymap.of(createBoundKeymap(controller.editor)),
            indentOnInput(),
            history({}),
            showMinimap.compute(['doc'], (state) => ({
                create,
                /* optional */
                displayText: 'characters',
                showOverlay: 'mouse-over',
                gutters: [{ 1: '#00FF00', 2: '#00FF00' }],
            })),
            lineNumbers({
                formatNumber: (lineNo) => `${lineNo}`,
                domEventHandlers: {
                    click: (editorView, line, event) => {
                        editorView.dispatch({
                            selection: { anchor: line.from },
                            scrollIntoView: true,
                        });
                        editorView.focus();
                        return true;
                    },
                },
            }),
            EditorState.tabSize.of(4),
            EditorState.readOnly.of(false),
        ];
    }

    static setupEventListeners(controller: EditorController): void {
        controller.editor.app.workspace.on('css-change', () => {
            if (
                controller.editor.plugin.settings.synchronizeSwaggerEditorTheme
            ) {
                controller.editor.controller.themeManager.syncWithObsidian();
            }
        });

        controller.editor.app.workspace.on(
            eventID.SwaggerEditorThemeState,
            () => {
                if (
                    controller.editor.plugin.settings
                        .synchronizeSwaggerEditorTheme
                ) {
                    controller.themeManager.syncWithObsidian();
                } else {
                    const mode =
                        controller.editor.plugin.settings.swaggerEditorTheme;
                    controller.editor.currentThemeMode = mode;
                    controller.editor.currentTheme =
                        mode === 'dark' ? darkTheme : lightTheme;
                    controller.themeManager.requestThemeChange();
                }
            }
        );
    }

    static initializeEditor(controller: EditorController): void {
        const file = controller.editor.file;
        if (file) {
            const isJson = file.extension === 'json';
            controller.editor.languageExtension = isJson ? json : yaml;

            if (controller.editor.editor) {
                controller.editor.editor.destroy();
            }

            controller.editor.editor = new EditorView({
                state: EditorState.create({
                    doc: controller.editor.data,
                    extensions: EditorUtils.createExtensions(controller),
                }),
                parent: controller.editor.contentEl,
            });
        }
    }

    static initializeActions(controller: EditorController): void {
        const themeButton = controller.editor.addAction(
            controller.themeManager.getThemeButtonIcon(),
            'Theme',
            (ev: MouseEvent) => {
                controller.themeManager.toggleThemeManually();
                controller.themeManager.requestThemeChange();
                setIcon(
                    themeButton,
                    controller.themeManager.getThemeButtonIcon()
                );
            }
        );
        controller.editor.app.workspace.on(
            eventID.SwaggerEditorThemeState,
            () =>
                setIcon(
                    themeButton,
                    controller.themeManager.getThemeButtonIcon()
                )
        );
    }
}
