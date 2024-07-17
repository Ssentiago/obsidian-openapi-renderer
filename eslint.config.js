const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

module.exports = [
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: "module",
                project: "./tsconfig.json"
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
        },
        rules: {
            "arrow-body-style": ["error", "as-needed"],
            // Отключение стандартных правил в пользу TypeScript-специфичных
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["error", {"argsIgnorePattern": "^_"}], // Запрещает неиспользуемые переменные, игнорируя аргументы, начинающиеся с _

            // Отключение правил, которые могут конфликтовать с TypeScript или вашими предпочтениями
            "@typescript-eslint/ban-ts-comment": "off", // Разрешает комментарии типа @ts-ignore
            "no-prototype-builtins": "off", // Разрешает использование методов прототипа напрямую
            "@typescript-eslint/no-empty-function": "off", // Разрешает пустые функции

            // TypeScript-специфичные правила
            "@typescript-eslint/explicit-function-return-type": "warn", // Требует явного указания типа возвращаемого значения функций
            "@typescript-eslint/no-inferrable-types": "warn", // Предупреждает о избыточном указании типов, которые можно вывести автоматически
            "@typescript-eslint/no-namespace": "error", // Запрещает использование пространств имен
            "@typescript-eslint/no-var-requires": "error", // Запрещает использование require для импортов
            "@typescript-eslint/consistent-type-assertions": "warn", // Обеспечивает согласованное использование приведения типов
            // "@typescript-eslint/no-unused-expressions": "warn", // Предупреждает о неиспользуемых выражениях
            "@typescript-eslint/consistent-type-definitions": ["error", "interface"], // Требует использования интерфейсов вместо типов
            // "@typescript-eslint/no-explicit-any": "warn", // Предупреждает об использовании типа any
            "@typescript-eslint/no-misused-promises": "error", // Запрещает неправильное использование промисов
            // "@typescript-eslint/no-non-null-assertion": "warn", // Предупреждает о использовании оператора !
            "@typescript-eslint/prefer-optional-chain": "warn", // Предпочитает использование опциональной цепочки
            "@typescript-eslint/ban-types": [
                "error",
                {
                    "types": {
                        "Function": false, // Разрешает использование Function
                    },
                    "extendDefaults": true,
                },
            ],
            "@typescript-eslint/no-unnecessary-condition": "warn", // Предупреждает о условиях, которые всегда истинны или ложны
            "@typescript-eslint/prefer-nullish-coalescing": "warn", // Предпочитает использование оператора ??
            "@typescript-eslint/no-floating-promises": "error", // Требует обработки промисов
            "@typescript-eslint/await-thenable": "error", // Гарантирует, что await используется только с Promises

            // Общие правила JavaScript (применимы как к JS, так и к TS)
            "array-callback-return": "error", // Требует возвращения значения из функций обратного вызова массива
            "eqeqeq": ["error", "always"], // Требует использования === и !==
            "no-duplicate-imports": "error", // Запрещает дублирование импортов
            "no-return-await": "error", // Запрещает ненужное использование await в return
            "no-useless-concat": "error", // Запрещает ненужное объединение строк
            "prefer-const": "error", // Требует использования const для неизменяемых переменных
            "prefer-template": "warn", // Предпочитает использование шаблонных строк
            "radix": "error", // Требует указания основания для функции parseInt
            "no-var": "error", // Запрещает использование var
            "no-throw-literal": "error", // Запрещает бросать литералы в качестве исключений
            "no-async-promise-executor": "error", // Запрещает асинхронные исполнители промисов
            "no-await-in-loop": "warn", // Предупреждает о await в циклах
            "no-constant-binary-expression": "error", // Запрещает постоянные бинарные выражения
            "no-use-before-define": ["error", {"functions": false, "classes": true}], // Запрещает использование переменных до их объявления
            "curly": ["error", "all"], // Требует фигурные скобки для всех блоков управления
            "default-param-last": "error", // Требует, чтобы параметры по умолчанию были последними
            "dot-notation": "error", // Требует использования точечной нотации при возможности
            "no-else-return": "error", // Запрещает else после return
            "no-empty-function": "warn", // Предупреждает о пустых функциях
            "no-loop-func": "error", // Запрещает создание функций внутри циклов
            "no-useless-return": "error", // Запрещает ненужные return
            "prefer-arrow-callback": "warn", // Предпочитает стрелочные функции для колбэков
            "prefer-rest-params": "error", // Предпочитает rest параметры вместо arguments
            "prefer-spread": "error", // Предпочитает spread оператор вместо .apply()

            "no-console": "warn", // Предупреждает об использовании console.log
        },
    },
    {
        files: ["**/*.js", "**/*.jsx"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
        },
    }
];