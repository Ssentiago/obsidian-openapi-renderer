import { createTheme } from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';

export const lightTheme = createTheme({
    theme: 'light',
    settings: {
        background: '#ffffff !important',
        foreground: '#008080 !important',
        caret: '#5d00ff !important',
        selection: '#cce5ff !important',
        selectionMatch: '#b3d9ff !important',
        lineHighlight: '#f5f5f5 !important',
        gutterBackground: '#f7f7f7 !important',
        gutterForeground: '#666666 !important',
        fontFamily: 'Courier New, monospace !important',
        fontSize: '16px',
    },
    styles: [
        { tag: t.comment, color: '#6a9955 !important' },

        { tag: t.propertyName, color: '#003a6c !important' },

        { tag: [t.string, t.special(t.brace)], color: '#ce9178 !important' },

        { tag: t.number, color: '#b5cea8 !important' },
        { tag: t.bool, color: '#569cd6 !important' },
        { tag: t.null, color: '#6a9955 !important' },

        { tag: t.keyword, color: '#c586c0 !important' },

        { tag: t.operator, color: '#d4d4d4 !important' },

        { tag: t.className, color: '#4ec9b0 !important' },
        { tag: t.definition(t.typeName), color: '#4ec9b0 !important' },
        { tag: t.typeName, color: '#4ec9b0 !important' },

        { tag: t.angleBracket, color: '#d4d4d4 !important' },
        { tag: t.tagName, color: '#569cd6 !important' },
        { tag: t.attributeName, color: '#9cdcfe !important' },
    ],
});

export const darkTheme = createTheme({
    theme: 'dark',
    settings: {
        background: '#1e1e1e !important',
        foreground: '#ce9178 !important',
        caret: '#ffcc00 !important',
        selection: '#3c3c3c !important',
        selectionMatch: '#4a4a4a !important',
        lineHighlight: '#2b2b2b !important',
        gutterBackground: '#2d2d2d !important',
        gutterForeground: '#7d7d7d !important',
        fontFamily: 'Courier New, monospace !important',
        // fontFamily: 'Consolas, monospace !important',
        // fontFamily: 'JetBrains Mono,monospace !important', // Шрифт
        // fontFamily: 'Fira Code,monospace !important', // Шрифт
        // fontFamily: 'Source Code Pro,monospace !important', // Шрифт
        fontSize: '16px',
    },
    styles: [
        { tag: t.comment, color: '#6a9955 !important' },

        { tag: t.propertyName, color: '#3dc9b0 !important' },

        { tag: [t.string, t.special(t.brace)], color: '#ce9178 !important' },

        { tag: t.number, color: '#b5cea8 !important' },
        { tag: t.bool, color: '#569cd6 !important' },
        { tag: t.null, color: '#6a9955 !important' },

        { tag: t.keyword, color: '#c586c0 !important' },

        { tag: t.operator, color: '#b0b0b0 !important' },

        { tag: t.angleBracket, color: '#d4d4d4 !important' },
        { tag: t.tagName, color: '#569cd6 !important' },
        { tag: t.attributeName, color: '#9cdcfe !important' },
    ],
});
