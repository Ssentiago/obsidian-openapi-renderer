import { foldGutter } from '@codemirror/language';
import { lintGutter } from '@codemirror/lint';
import { highlightSelectionMatches } from '@codemirror/search';
import { Compartment } from '@codemirror/state';
import { highlightActiveLine, lineNumbers } from '@codemirror/view';
import OpenAPIRendererPlugin from 'core/openapi-renderer-plugin';
import { linkHighlightExtension } from 'view/views/OpenAPI/components/source/extensions/link-highlighting';
import yamlJsonLinter from 'view/views/OpenAPI/components/source/extensions/linter';
import OpenAPICompletionExtension from 'view/views/OpenAPI/components/source/extensions/openapi-completion';
import {
    BaseExtensionsStorage,
    ExtensionConfig,
    ExtensionsConfigStorage,
    ExtensionsStorage,
    UserExtensions,
} from 'view/views/OpenAPI/components/source/typing/interfaces';

export class ExtensionManager {
    extensionsStorage = {} as ExtensionsConfigStorage;

    constructor(public plugin: OpenAPIRendererPlugin) {
        this.initializeManager();
    }

    /**
     * Initializes the extensions manager.
     *
     * This method creates and initializes user extensions configurations for the source mode.
     *
     * @private
     * @returns {void} No return value.
     */
    private initializeManager(): void {
        const extensions: ExtensionConfig[] = [
            {
                id: UserExtensions.Folding,
                name: 'Folding',
                type: 'User',
                on: true,
                get compartment() {
                    return new Compartment();
                },
                get extension() {
                    return foldGutter();
                },
            },
            {
                id: UserExtensions.Linter,
                name: 'Linter',
                type: 'User',
                on: true,
                get compartment() {
                    return new Compartment();
                },
                get extension() {
                    return [yamlJsonLinter, lintGutter()];
                },
            },
            {
                id: UserExtensions.LineNumbers,
                name: 'Line Numbers',
                type: 'User',
                on: true,
                get compartment() {
                    return new Compartment();
                },
                get extension() {
                    return lineNumbers({
                        formatNumber: (lineNo) => `${lineNo}`,
                        domEventHandlers: {
                            click: (editorView, line) => {
                                editorView.dispatch({
                                    selection: { anchor: line.from },
                                    scrollIntoView: true,
                                });
                                editorView.focus();
                                return true;
                            },
                        },
                    });
                },
            },
            {
                id: UserExtensions.HighlightSelectionMatches,
                name: 'Highlight Selection Matches',
                type: 'User',
                on: true,
                get compartment() {
                    return new Compartment();
                },
                get extension() {
                    return highlightSelectionMatches();
                },
            },
            {
                id: UserExtensions.OpenAPICompletion,
                name: 'OpenAPI Completion',
                type: 'User',
                on: true,
                get compartment() {
                    return new Compartment();
                },
                get extension() {
                    return OpenAPICompletionExtension;
                },
            },
            {
                id: UserExtensions.LinkHighlightExtension,
                name: 'Link Highlight Extension',
                type: 'User',
                on: true,
                get compartment() {
                    return new Compartment();
                },
                get extension() {
                    return linkHighlightExtension;
                },
            },
            {
                id: UserExtensions.HighlightActiveLine,
                name: 'Highlight Active Line',
                type: 'User',
                on: true,
                get compartment() {
                    return new Compartment();
                },
                get extension() {
                    return highlightActiveLine();
                },
            },
        ];

        extensions.forEach((extension) => {
            this.extensionsStorage[extension.id] = extension;
        });
    }

    /**
     * Get the extensions that are used in the settings.
     *
     * @returns An object with the id as the key and an object with the name and on/off status as the value.
     */
    get pluginSettingsExtensions(): BaseExtensionsStorage {
        return Object.values(this.extensionsStorage).reduce((acc, config) => {
            acc[config.id] = {
                name: config.name,
                on: config.on,
            };
            return acc;
        }, {} as BaseExtensionsStorage);
    }

    /**
     * Get the extensions that are used in the view.
     *
     * @returns An object with the id as the key and an object with the name, type, extension and compartment as the value.
     */
    get viewExtensions(): ExtensionsStorage {
        return Object.values(this.extensionsStorage).reduce((acc, config) => {
            acc[config.id] = {
                name: config.name,
                type: config.type,
                extension: config.extension,
                compartment: config.compartment,
            };
            return acc;
        }, {} as ExtensionsStorage);
    }
}
