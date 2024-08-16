import { OpenAPISource } from '../OpenAPI-source';
import yamlJsonLinter from '../extensions/linter';
import { closeBrackets } from '@codemirror/autocomplete';
import {
    EditorView,
    highlightActiveLine,
    keymap,
    lineNumbers,
    ViewUpdate,
} from '@codemirror/view';
import {
    bracketMatching,
    defaultHighlightStyle,
    foldGutter,
    indentOnInput,
    LanguageSupport,
    syntaxHighlighting,
} from '@codemirror/language';
import createBoundKeymap from '../extensions/keymap';
import { history } from '@codemirror/commands';
import { EditorState, Extension } from '@codemirror/state';
import { eventID, eventPublisher, Subject } from 'typing/constants';
import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { setIcon } from 'obsidian';
import { SourceController } from './source-controller';
import OpenAPICompletionExtension from '../extensions/openapi-completion';
import { linkHighlightExtension } from '../extensions/linkHighLighting';
import { lintGutter } from '@codemirror/lint';
import { highlightSelectionMatches } from '@codemirror/search';
import convertFile from '../extensions/yamlJsonConverter';
import openAPIFormatter from '../extensions/formatter';
import { EditorChangedEvent } from 'typing/interfaces';

const create: (v: EditorView) => { dom: HTMLDivElement } = (v: EditorView) => {
    const dom = document.createElement('div');
    return { dom };
};

let fontSize = 16;
const tooltip = document.createElement('div');
tooltip.addClass('openapi-renderer-source-tooltip');
document.body.appendChild(tooltip);

function updateTooltip(x: number, y: number, fontSize: number): void {
    tooltip.textContent = `Font Size: ${fontSize}px`;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.style.display = 'block';
}

function changeFontSize(view: EditorView, delta: number): void {
    fontSize = Math.max(10, fontSize + delta); // Убедитесь, что размер не становится слишком маленьким
    view.dom.style.fontSize = `${fontSize}px`;

    updateTooltip(
        view.dom.getBoundingClientRect().right - 100,
        view.dom.getBoundingClientRect().top + 10,
        fontSize
    );
}

function handleEditorEvents(view: EditorView) {
    let timeout: NodeJS.Timeout | null = null;
    return function (event: Event): void {
        if (event.type === 'wheel' && (event as WheelEvent).ctrlKey) {
            const wheelEvent = event as WheelEvent;
            const delta = wheelEvent.deltaY > 0 ? -1 : 1;
            changeFontSize(view, delta);
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                tooltip.style.display = 'none';
                timeout = null;
            }, 2000);
        }
    };
}

function onChange(editor: OpenAPISource) {
    let timeout: NodeJS.Timeout | null = null;
    return (): void => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            const event = {
                eventID: eventID.EditorChanged,
                publisher: eventPublisher.Editor,
                subject: Subject.Preview,
                timestamp: new Date(),
                emitter: editor.plugin.app.workspace,
            } as EditorChangedEvent;
            editor.plugin.publisher.publish(event);
        }, 300);
    };
}

export class SourceUtils {
    static createExtensions(
        editor: OpenAPISource
    ): ({ extension: Extension } | readonly Extension[] | LanguageSupport)[] {
        const onChangeHandler = onChange(editor);
        return [
            editor.controller.themeManager.themeConfigurator.of(
                editor.currentTheme
            ),
            editor.languageExtension(),
            EditorView.updateListener.of((update: ViewUpdate) => {
                if (update.docChanged) {
                    onChangeHandler();
                }
            }),
            closeBrackets(),
            yamlJsonLinter,
            foldGutter(),
            bracketMatching(),
            lintGutter(),
            highlightSelectionMatches(),
            OpenAPICompletionExtension,
            linkHighlightExtension,
            highlightActiveLine(),
            syntaxHighlighting(defaultHighlightStyle),
            keymap.of(createBoundKeymap(editor)),
            indentOnInput(),
            history({}),
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

    static setupEventListeners(controller: SourceController): void {
        const { settings } = controller.editor.plugin;
        controller.editor.view.app.workspace.on('css-change', () => {
            if (settings.synchronizeOpenAPISourceTheme) {
                controller.editor.controller.themeManager.syncWithObsidian();
            }
        });

        controller.editor.view.plugin.observer.subscribe(
            controller.editor.view.plugin.app.workspace,
            eventID.SourceThemeState,
            async () => {
                if (settings.synchronizeOpenAPISourceTheme) {
                    controller.themeManager.syncWithObsidian();
                } else {
                    const mode = settings.OpenAPISourceThemeMode;
                    const theme =
                        controller.themeManager.getEditorCurrentThemeByMode(
                            mode
                        );
                    if (theme) {
                        controller.editor.currentThemeMode = mode;
                        controller.editor.currentTheme = theme;
                        controller.themeManager.requestSourceThemeChange();
                    }
                }
            }
        );
    }

    static initializeEditor(controller: SourceController): void {
        const file = controller.editor.view.file;
        if (!file) {
            return;
        }
        const isJson = file.extension === 'json';
        controller.editor.languageExtension = isJson ? json : yaml;

        controller.editor.editor = new EditorView({
            state: EditorState.create({
                doc: controller.editor.view.data,
                extensions: SourceUtils.createExtensions(controller.editor),
            }),
            parent: controller.editor.contentEl,
        });
        const { dom } = controller.editor.editor;
        const boundHandler = handleEditorEvents(controller.editor.editor);
        controller.editor.editor.dom.addEventListener('wheel', boundHandler, {
            passive: true,
        });
        dom.addEventListener('mousemove', boundHandler, { passive: true });
        dom.addEventListener('mouseup', boundHandler, { passive: true });
    }

    static initializeActions(controller: SourceController): void {
        const { app, plugin } = controller.editor.view;
        const { view } = controller.editor;

        const themeButton = view.addAction(
            controller.themeManager.getThemeButtonIcon(),
            'Theme',
            (ev: MouseEvent) => {
                controller.themeManager.toggleThemeManually();
                controller.themeManager.requestSourceThemeChange();
                setIcon(
                    themeButton,
                    controller.themeManager.getThemeButtonIcon()
                );
            }
        );

        plugin.observer.subscribe(
            app.workspace,
            eventID.SourceThemeState,
            async () =>
                setIcon(
                    themeButton,
                    controller.themeManager.getThemeButtonIcon()
                )
        );

        const convertButton = view.addAction(
            'arrow-right-left',
            'Convert File between JSON and YAML',
            convertFile(controller.editor.view, controller.editor)
        );

        const formatButton = view.addAction(
            'code',
            'Format',
            openAPIFormatter(controller.editor)
        );

        plugin.observer.subscribe(
            app.workspace,
            eventID.SwitchModeState,
            async () => {
                themeButton.remove();
                convertButton.remove();
                formatButton.remove();
            }
        );
    }
}
