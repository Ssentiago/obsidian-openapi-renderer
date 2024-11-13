import { closeBrackets } from '@codemirror/autocomplete';
import { history } from '@codemirror/commands';
import {
    bracketMatching,
    defaultHighlightStyle,
    indentOnInput,
    LanguageSupport,
    syntaxHighlighting,
} from '@codemirror/language';
import { Compartment, EditorState, Extension } from '@codemirror/state';
import { EditorView, keymap, ViewUpdate } from '@codemirror/view';
import { SourceController } from 'view/views/OpenAPI/components/source/controllers/source-controller';
import createBoundKeymap from 'view/views/OpenAPI/components/source/extensions/keymap';
import { onChange } from 'view/views/OpenAPI/components/source/handlers/editor-handlers';
import {
    handleChangeFontSizeOnWHeel,
    handleScroll,
} from 'view/views/OpenAPI/components/source/handlers/wheel-scroll-handlers';
import {
    ExtensionsStorage,
    UserExtensions,
} from 'view/views/OpenAPI/components/source/typing/interfaces';

export class ExtensionController {
    storage!: ExtensionsStorage;
    themeConfigurator = new Compartment();
    languageConfigurator = new Compartment();

    languageExtension!: () => LanguageSupport;

    constructor(public controller: SourceController) {
        this.storage =
            this.controller.source.view.plugin.sourceExtensionsManager.viewExtensions;
    }

    /**
     * Default extensions for the OpenAPI source code editor.
     *
     * @returns An array of extensions. Each extension can be either an object with a single
     * `extension` property, or an array of extensions, or a `LanguageSupport` object.
     */
    get defaultExtensions(): (
        | { extension: Extension }
        | readonly Extension[]
        | LanguageSupport
    )[] {
        const boundWheelHandler = handleChangeFontSizeOnWHeel();
        const { source } = this.controller;
        const userExtensions: Extension[] = [];

        Object.entries(
            this.controller.source.view.plugin.settings.extensions
        ).forEach(([id, config]) => {
            if (config.on) {
                const ext = this.storage[id as UserExtensions].compartment.of(
                    this.storage[id as UserExtensions].extension
                );
                userExtensions.push(ext);
            }
        });

        return [
            this.themeConfigurator.of(this.controller.source.currentTheme),
            this.languageConfigurator.of(
                source.controller.extensionController.languageExtension()
            ),
            userExtensions,
            EditorView.updateListener.of((update: ViewUpdate) => {
                if (update.docChanged) {
                    onChange(source, update);
                }
            }),
            EditorView.domEventHandlers({
                wheel(event, view) {
                    boundWheelHandler(event, view);
                    return false;
                },
                scroll(event) {
                    handleScroll(source, event);
                    return false;
                },
            }),
            closeBrackets(),
            bracketMatching(),
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            history(),
            keymap.of(createBoundKeymap(source)),
            indentOnInput(),
            EditorState.tabSize.of(4),
        ];
    }
}
