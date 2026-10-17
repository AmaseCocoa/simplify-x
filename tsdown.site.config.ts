import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['site/main.ts'],
    outDir: 'site-dist/assets',
    outputOptions: { entryFileNames: 'main.js' },
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    dts: false,
    clean: true,
});
