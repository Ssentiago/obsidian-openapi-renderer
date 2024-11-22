import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';
import { visualizer } from 'rollup-plugin-visualizer';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import css from "rollup-plugin-import-css";
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import progress from 'rollup-plugin-progress';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const name = 'openapi-renderer';

const baseConfig = {
    input: 'src/main.ts',
    external: ['obsidian', 'electron'],
    plugins: [
        json(),
        replace({
            preventAssignment: true,
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        alias({
            entries: [
                {
                    find: 'assets',
                    replacement: path.resolve(__dirname, 'src/assets'),
                },
                {
                    find: 'react',
                    replacement: 'preact/compat',
                },
                {
                    find: 'react-dom',
                    replacement: 'preact/compat',
                },
            ],
        }),
        css({minify: true}),
        nodeResolve({
            preferBuiltins: true,
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        }),
        commonjs({
            include: 'node_modules/**',
        }),
        typescript(),
        webWorkerLoader({
            inline: true,
            forceInline: true,
            targetPlatform: 'browser',
            format: 'cjs',
        }),
        progress({
            clearLine: true,
        }),
    ],
};

const developmentConfig = {
    ...baseConfig,
    output: {
        dir: 'test-vault/.obsidian/plugins/openapi-renderer',
        sourcemap: false,
        format: 'cjs',
        exports: 'auto',
        name,
    },
    plugins: [
        ...baseConfig.plugins,
        copy({
            targets: [
                {
                    src: './styles.css',
                    dest: 'test-vault/.obsidian/plugins/openapi-renderer/',
                },
                {
                    src: './manifest.json',
                    dest: 'test-vault/.obsidian/plugins/openapi-renderer/',
                },
                {
                    src: './.hotreload',
                    dest: 'test-vault/.obsidian/plugins/openapi-renderer/',
                },
            ],
        }),
    ],
};

const productionConfig = {
    ...baseConfig,
    output: {
        name,
        dir: 'dist',
        sourcemap: false,
        sourcemapExcludeSources: true,
        format: 'cjs',
        exports: 'auto',
    },
    plugins: [
        ...baseConfig.plugins,
        replace({
            'process.env.NODE_ENV': JSON.stringify('production'),
            preventAssignment: true,
        }),
        copy({
            targets: [
                { src: './styles.css', dest: 'dist/' },
                { src: './manifest.json', dest: 'dist/' },
            ],
        }),
        terser({
            compress: true,
            mangle: true,
        }),
        visualizer({
            open: false,
            filename: 'bundle-analysis.html',
        }),
    ],
};

const config =
    process.env.PRODUCTION === '1' ? productionConfig : developmentConfig;
export default config;
