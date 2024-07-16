// const tsParser = require("@typescript-eslint/parser");
// const tsPlugin = require("@typescript-eslint/eslint-plugin");
//
// module.exports [
//     {
//         files: ["**/*.ts", "**/*.tsx"],
//         languageOptions: {
//             parser: tsParser,
//             parserOptions: {
//                 sourceType: "module",
//             },
//         },
//         plugins: {
//             "@typescript-eslint": tsPlugin,
//         },
//         rules: {
//             // Отключаем стандартное правило для неиспользуемых переменных
//             "no-unused-vars": "off",
//             // Используем правило TypeScript для неиспользуемых переменных, игнорируя аргументы
//             "@typescript-eslint/no-unused-vars": ["error", {args: "none"}],
//             // Отключаем правило, запрещающее комментарии типа @ts-ignore
//             "@typescript-eslint/ban-ts-comment": "off",
//             // Отключаем правило, запрещающее использование метода hasOwnProperty
//             "no-prototype-builtins": "off",
//             // Отключаем правило, запрещающее пустые функции
//             "@typescript-eslint/no-empty-function": "off",
//
//             // Рекомендуемые правила
//             // Требует явно указывать возвращаемый тип функций
//             "@typescript-eslint/explicit-function-return-type": "warn",
//             // Предупреждает об избыточных типах, которые можно вывести автоматически
//             "@typescript-eslint/no-inferrable-types": "warn",
//             // Запрещает использование пространства имён
//             "@typescript-eslint/no-namespace": "error",
//             // Запрещает использование функции require для импортов
//             "@typescript-eslint/no-var-requires": "error",
//             // Требует использование одного типа утверждений
//             "@typescript-eslint/consistent-type-assertions": "warn",
//             // Запрещает неиспользуемые выражения
//             "@typescript-eslint/no-unused-expressions": "error",
//             // Требует использование интерфейсов вместо типов
//             "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
//             // Предупреждает о использовании типа any
//             "@typescript-eslint/no-explicit-any": "warn",
//             // Запрещает неправильное использование промисов
//             "@typescript-eslint/no-misused-promises": "error",
//             // Предупреждает о неявном использовании оператора !
//             "@typescript-eslint/no-non-null-assertion": "warn",
//             // Предпочтение опциональной цепочки вместо вложенных проверок
//             "@typescript-eslint/prefer-optional-chain": "warn",
//             // Запрещает использование определённых типов
//             "@typescript-eslint/ban-types": [
//                 "error",
//                 {
//                     types: {
//                         Function: false, // Разрешает использование Function
//                     },
//                     extendDefaults: true,
//                 },
//             ],
//             // Требует возвращение значения из функции обратного вызова массива
//             "array-callback-return": "error",
//             // Требует использования строгого равенства === и !==
//             "eqeqeq": ["error", "always"],
//             // Запрещает дублирование импортов
//             "no-duplicate-imports": "error",
//             // Запрещает использование await в return
//             "no-return-await": "error",
//             // Запрещает ненужное объединение строк
//             "no-useless-concat": "error",
//             // Предпочитает использование const для неизменяемых переменных
//             "prefer-const": "error",
//             // Предпочитает использование шаблонных строк вместо конкатенации
//             "prefer-template": "warn",
//             // Требует указания основания для функции parseInt
//             "radix": "error",
//             // Требует использование async-await в асинхронных функциях
//             "require-await": "error"
//         }
//     },
//         {
//             files: ["**/*.js", "**/*.jsx"],
//             languageOptions: {
//                 parserOptions: {
//                     sourceType: "module",
//                 },
//             },
//             rules: {
//                 // Запрещает объявления переменных, которые не используются
//                 "no-unused-vars": "error",
//                 // Требует явно указывать возвращаемый тип функций
//                 "consistent-return": "error",
//                 // Запрещает изменять переменные, объявленные с помощью const
//                 "no-const-assign": "error",
//                 // Запрещает использование console
//                 "no-console": "warn",
//                 // Требует использования строгого равенства === и !==
//                 "eqeqeq": ["error", "always"],
//                 // Запрещает повторное объявление переменных
//                 "no-redeclare": "error",
//                 // Запрещает объявление функций в циклах
//                 "no-loop-func": "error",
//                 // Запрещает использование var, предпочитая let или const
//                 "no-var": "error",
//                 // Требует использования let или const вместо var
//                 "no-use-before-define": ["error", {"functions": false, "classes": true}],
//                 // Требует использования const для переменных, которые не изменяются
//                 "prefer-const": ["error", {
//                     "destructuring": "all",
//                     "ignoreReadBeforeAssign": true
//                 }],
//                 // Предпочитает шаблонные строки вместо конкатенации
//                 "prefer-template": "error",
//                 // Запрещает пустые блоки
//                 "no-empty": ["error", {"allowEmptyCatch": true}],
//                 // Запрещает ненужное объединение строк
//                 "no-useless-concat": "error",
//                 // Запрещает дублирование импортов
//                 "no-duplicate-imports": "error",
//                 // Требует возвращение значения из функции обратного вызова массива
//                 "array-callback-return": "error",
//                 // Требует использование оператора свертки (spread) вместо метода apply
//                 "prefer-spread": "error"
//             }
//         }
//     ];
