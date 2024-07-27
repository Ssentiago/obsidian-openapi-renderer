import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';


const name = 'openapi-renderer';

const baseConfig = {
    input: 'src/main.ts',
    external: ['obsidian'],
    plugins: [
        json(),
        nodeResolve({
            preferBuiltins: true
        }),
        commonjs({
            include: 'node_modules/**'
        }),
        typescript(),
    ],
};


const developmentConfig = {
    ...baseConfig,
    output: {
        dir: 'test-vault/.obsidian/plugins/openapi-renderer',
        sourcemap: false,
        format: 'cjs',
        exports: 'auto',
        name
    },
    plugins: [
        ...baseConfig.plugins,
        copy({
            targets: [
                {src: './styles.css', dest: 'test-vault/.obsidian/plugins/openapi-renderer/'},
                {src: './manifest.json', dest: 'test-vault/.obsidian/plugins/openapi-renderer/'},
                {src: './src/assets', dest: 'test-vault/.obsidian/plugins/openapi-renderer/'},
                {src: './.hotreload', dest: 'test-vault/.obsidian/plugins/openapi-renderer/'},
            ],
        }),
    ],
};


const productionConfig = {
    ...baseConfig,
    output: {
        dir: 'dist',
        sourcemap: false,
        sourcemapExcludeSources: true,
        format: 'cjs',
        exports: 'auto',
        name
    },
    plugins: [
        ...baseConfig.plugins,
        copy({
            targets: [
                {src: './styles.css', dest: 'dist/'},
                {src: './manifest.json', dest: 'dist/'},
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
