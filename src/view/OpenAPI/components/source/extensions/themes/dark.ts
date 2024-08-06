import { tags as t } from '@lezer/highlight';
import { createTheme } from '@uiw/codemirror-themes';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';

const defaultDarkTheme = createTheme({
    theme: 'dark',
    settings: {
        background: '#1e1e1e',
        foreground: '#ce9178',
        caret: '#ffcc00',
        selection: '#3c3c3c',
        selectionMatch: '#4a4a4a',
        lineHighlight: '#2b2b2b',
        gutterBackground: '#2d2d2d',
        gutterForeground: '#7d7d7d',
        // fontFamily: 'Courier New, monospace',
        // fontFamily: 'Consolas, monospace !important',
        fontFamily: 'JetBrains Mono,monospace !important', // Шрифт
        // fontFamily: 'Fira Code,monospace !important', // Шрифт
        // fontFamily: 'Source Code Pro,monospace !important', // Шрифт
        fontSize: '16px',
    },
    styles: [
        { tag: t.comment, color: '#6a9955' },

        { tag: t.propertyName, color: '#3dc9b0' },

        { tag: [t.string, t.special(t.brace)], color: '#ce9178' },

        { tag: t.number, color: '#b5cea8' },
        { tag: t.bool, color: '#569cd6' },
        { tag: t.null, color: '#6a9955' },

        { tag: t.keyword, color: '#c586c0' },

        { tag: t.operator, color: '#b0b0b0' },

        { tag: t.angleBracket, color: '#d4d4d4' },
        { tag: t.tagName, color: '#569cd6' },
        { tag: t.attributeName, color: '#9cdcfe' },
    ],
});

const themes = {
    dark: {
        default: defaultDarkTheme,
        vscode: vscodeDark,
    },
};

export const darkThemes = new Map(
    Object.entries(themes).map(([key, value]) => [
        key,
        new Map(Object.entries(value)),
    ])
);
