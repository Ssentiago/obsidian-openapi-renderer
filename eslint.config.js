import obsidianmd from 'eslint-plugin-obsidianmd';
import reactX from 'eslint-plugin-react-x';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    globalIgnores([
        'node_modules',
        'dist',
        'test-vault',
        'graphify-out',
        '.idea',
        'assets',
        'src/assets/**',
        'eslint.config.js',
        'main.js',
        // TS-парсер не умеет JSON, все .json дают fatal parse error.
        '**/*.json',
    ]),
    {
        languageOptions: {
            globals: { ...globals.browser },
            parserOptions: {
                projectService: {
                    allowDefaultProject: [
                        'eslint.config.js',
                        'rollup.config.ts',
                    ],
                },
                tsconfigRootDir: import.meta.dirname,
                extraFileExtensions: ['.json'],
            },
        },
    },
    // Корневые build-конфиги живут в Node, им нужен process.
    {
        files: ['**/*.{js,cjs,mjs}', 'rollup.config.ts'],
        languageOptions: {
            globals: { ...globals.node },
        },
    },
    // Правила obsidianmd/* для обсидиан-плагинов. Пресет тянет ESLint core и
    // type-checked правила typescript-eslint, поэтому их отдельно не подключаем.
    ...obsidianmd.configs.recommendedWithLocalesEn,
    {
        rules: {
            // Единственное правило, выключенное в recommended, включаем.
            'obsidianmd/prefer-active-doc': 'warn',
            // Вкладка настроек рисуется кастомным React-UI, декларативный
            // API настроек к ней не применяется.
            'obsidianmd/settings-tab/prefer-setting-definitions': 'off',
        },
    },
    // TypeScript сам ловит необъявленные идентификаторы, no-undef здесь дубль.
    {
        files: ['**/*.{ts,tsx,mts,cts}'],
        rules: {
            'no-undef': 'off',
        },
    },
    // console в логгере это его работа, а не лишний вывод.
    {
        files: ['src/logging/**', 'rollup.config.ts'],
        rules: {
            'obsidianmd/rule-custom-message': 'off',
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        plugins: {
            'react-x': reactX,
        },
        rules: {
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/consistent-type-assertions': 'warn',
            '@typescript-eslint/consistent-type-definitions': [
                'error',
                'interface',
            ],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-inferrable-types': 'warn',
            '@typescript-eslint/no-namespace': 'error',
            '@typescript-eslint/no-non-null-assertion': 'warn',
            '@typescript-eslint/no-unnecessary-condition': 'warn',
            '@typescript-eslint/no-unnecessary-type-assertion': 'error',
            '@typescript-eslint/no-unused-expressions': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/no-var-requires': 'error',
            '@typescript-eslint/prefer-includes': 'warn',
            '@typescript-eslint/prefer-nullish-coalescing': 'warn',
            '@typescript-eslint/prefer-optional-chain': 'warn',
            '@typescript-eslint/prefer-readonly': 'warn',
            '@typescript-eslint/prefer-string-starts-ends-with': 'warn',
            '@typescript-eslint/switch-exhaustiveness-check': 'error',
            'array-callback-return': 'error',
            'arrow-body-style': ['error', 'as-needed'],
            'consistent-return': 'error',
            'default-param-last': 'error',
            'dot-notation': 'error',
            eqeqeq: ['error', 'always'],
            'no-async-promise-executor': 'error',
            'no-await-in-loop': 'off',
            'no-constant-binary-expression': 'error',
            'no-duplicate-imports': 'error',
            'no-else-return': 'error',
            'no-empty-function': 'warn',
            'no-extra-bind': 'error',
            'no-loop-func': 'error',
            'no-magic-numbers': 'off',
            'no-prototype-builtins': 'off',
            'no-return-await': 'error',
            'no-sequences': 'error',
            'no-throw-literal': 'error',
            'no-unneeded-ternary': 'error',
            'no-use-before-define': [
                'error',
                { functions: false, classes: true },
            ],
            'no-useless-concat': 'error',
            'no-useless-return': 'error',
            'no-var': 'error',
            'object-shorthand': 'error',
            'prefer-arrow-callback': 'warn',
            'prefer-const': 'error',
            'prefer-rest-params': 'error',
            'prefer-spread': 'error',
            'prefer-template': 'warn',
            radix: 'error',
            'react-x/exhaustive-deps': 'warn',
            'react-x/no-unused-state': 'warn',
            'react-x/rules-of-hooks': 'error',
            yoda: 'error',
        },
    }
);
