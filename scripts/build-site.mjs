import { copyFile, mkdir, writeFile } from 'node:fs/promises';

await mkdir('site-dist', { recursive: true });
await Promise.all([
    copyFile('site/index.html', 'site-dist/index.html'),
    copyFile('site/style.css', 'site-dist/assets/style.css'),
    copyFile('dist/simplify-x.user.js', 'site-dist/simplify-x.user.js'),
    writeFile('site-dist/.nojekyll', ''),
]);
console.log('GitHub Pages: site-dist/');
