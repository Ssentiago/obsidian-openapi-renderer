import { createTheme } from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';
import { vscodeLight } from '@uiw/codemirror-theme-vscode';

const defaultLightTheme = createTheme({
    theme: 'light',
    settings: {
        background: '#f7f7f7 !important',
        foreground: '#333333 !important',
        caret: '#6a0dad !important',
        selection: '#e0e0e0 !important',
        selectionMatch: '#d0d0d0 !important',
        lineHighlight: '#f0f0f0 !important',
        gutterBackground: '#fafafa !important',
        gutterForeground: '#888888 !important',
        fontFamily: 'JetBrains Mono,monospace !important',
        fontSize: '16px',
    },
    styles: [
        { tag: t.comment, color: '#8a8a8a !important' },

        { tag: t.propertyName, color: '#005b9a !important' },

        { tag: [t.string, t.special(t.brace)], color: '#a76e56 !important' },

        { tag: t.number, color: '#7b8d6f !important' },
        { tag: t.bool, color: '#5f8fbc !important' },
        { tag: t.null, color: '#8a8a8a !important' },

        { tag: t.keyword, color: '#a572a0 !important' },

        { tag: t.operator, color: '#b0b0b0 !important' },

        { tag: t.className, color: '#2d8f8e !important' },
        { tag: t.definition(t.typeName), color: '#2d8f8e !important' },
        { tag: t.typeName, color: '#2d8f8e !important' },

        { tag: t.angleBracket, color: '#b0b0b0 !important' },
        { tag: t.tagName, color: '#5f8fbc !important' },
        { tag: t.attributeName, color: '#7d8bff !important' },
    ],
});

const themes = {
    light: {
        default: defaultLightTheme,
        vscode: vscodeLight,
    },
};

export const lightThemes = new Map(
    Object.entries(themes).map(([key, value]) => [
        key,
        new Map(Object.entries(value)),
    ])
);
