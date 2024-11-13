import { Compartment, Extension } from '@codemirror/state';

type ExtensionType = 'User' | 'Service';

export enum UserExtensions {
    Folding = 'folding',
    Linter = 'linter',
    LineNumbers = 'lineNumbers',
    HighlightSelectionMatches = 'highlightSelectionMatches',
    OpenAPICompletion = 'openAPICompletion',
    LinkHighlightExtension = 'linkHighlightExtension',
    HighlightActiveLine = 'highlightActiveLine',
}

export interface BaseExtension {
    name: string;
    on: boolean;
}

export interface SourceExtension {
    name: string;
    compartment: Compartment;
    extension: Extension;
    type: ExtensionType;
}

/**
 * This type is used for retrieving and using in the plugin settings
 */
export type BaseExtensionsStorage = {
    [key in UserExtensions]: BaseExtension;
};

/**
 * This type is used for retrieving and using in the view extensionController
 */
export type ExtensionsStorage = {
    [key in UserExtensions]: SourceExtension;
};

export interface ExtensionConfig extends BaseExtension {
    id: UserExtensions;
    type: ExtensionType;
    get compartment(): Compartment;
    get extension(): Extension | Extension[];
}

/**
 * This type is using in global extensions manager
 */
export type ExtensionsConfigStorage = {
    [key in UserExtensions]: ExtensionConfig;
};
