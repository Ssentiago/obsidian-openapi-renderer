import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import cjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';
import {string} from 'rollup-plugin-string';
import url from "rollup-plugin-url";


const name = 'openapi-renderer';

const developmentConfig = {
    input: 'src/main.ts',
    external: ['obsidian'],
    output: {
        dir: 'test-vault/.obsidian/plugins/openapi-renderer',
        sourcemap: false,
        format: 'cjs',
        exports: 'auto',
        name
    },
    plugins: [
        string({
            include: [
                '**/swagger-ui.module.css',
                '**/swagger-ui-bundle.module.js',
                '**/js-yaml.module.js'
            ],
        }),
        // postcss({
        //     extensions: ['.css'],
        //     inject: false,
        //     extract: false,
        //     exclude: '**/swagger-ui.module.css', // Исключаем файл из обработки PostCSS
        // }),
        json(),
        nodeResolve({preferBuiltins: true}),
        cjs({include: 'node_modules/**'}),
        typescript({tsconfig: './tsconfig.devs.json'}),
        copy({
            targets: [
<<<<<<< HEAD
                {
                    src: './styles.css',
                    dest: 'test-vault/.obsidian/plugins/openapi-renderer/',
                },
                {
                    src: './manifest.json',
                    dest: 'test-vault/.obsidian/plugins/openapi-renderer/',
                },
=======
                {src: './styles.css', dest: 'test-vault/.obsidian/plugins/openapi-renderer/'},
                {src: './swagger-pet-store-example.html', dest: 'dist/'},
                {src: './manifest.json', dest: 'test-vault/.obsidian/plugins/openapi-renderer/'},
>>>>>>> 4f8b677 (added proxy)
            ],
        }),
    ],
};
const productionConfig = {
    input: 'src/main.ts',
    external: ['obsidian'],
    output: {
        dir: 'dist',
        sourcemap: false,
        sourcemapExcludeSources: true,
        format: 'cjs',
        exports: 'auto',
        name
    },
    plugins: [
        json(),
        nodeResolve({preferBuiltins: true}),
        cjs({include: 'node_modules/**'}),
        typescript({tsconfig: './tsconfig.prod.json'}),
        copy({
            targets: [
                {
                    src: './styles.css',
                    dest: 'dist/',
                },
                {
                    src: './swagger-pet-store-example.html',
                    dest: 'dist/',
                },
                {
                    src: './manifest.json',
                    dest: 'dist/',
                },
            ],
        }),
        terser({
            compress: true,
            mangle: true
        }),
    ],
};

const config = process.env.PRODUCTION === '1' ? productionConfig : developmentConfig;
export default config;
