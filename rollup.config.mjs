import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import cjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const name = 'openapi-renderer';

const developmentConfig = {
    input: 'src/main.ts',
    external: ['obsidian'],
    output: {
        dir: 'test-vault/.obsidian/plugins/openapi-renderer',
        sourcemap: false,
        format: 'cjs',
        exports: 'auto',
    },
    plugins: [
        json(),
        nodeResolve({preferBuiltins: true}),
        cjs({include: 'node_modules/**'}),
        typescript({tsconfig: './tsconfig.devs.json'}),
        copy({
            targets: [
                {src: './styles.css',
                dest: 'test-vault/.obsidian/plugins/openapi-renderer/',},
                {
                    src: './assets',
                    dest: 'test-vault/.obsidian/plugins/openapi-renderer/',
                },
                {
                    src: './manifest.json',
                    dest: 'test-vault/.obsidian/plugins/openapi-renderer/',
                },
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
    },
    plugins: [
        json(),
        nodeResolve({preferBuiltins: true}),
        cjs({include: 'node_modules/**'}),
        typescript({tsconfig: './tsconfig.prod.json'}),
        copy({
            targets: [
                {src: './styles.css',
                dest: 'dist/',},
                {
                    src: './assets',
                    dest: 'dist/',
                },
                {
                    src: './manifest.json',
                    dest: 'dist/',
                },
            ],
        }),
        terser({
            compress: {
                drop_console: true,
            },
            mangle: true
        }),
    ],
};

const config = process.env.PRODUCTION === '1' ? productionConfig : developmentConfig;
export default config;
