import { defineConfig } from "tsdown";
import { userScriptPlugin } from "./plugins/userScript.ts";

export default defineConfig({
  entry: ['./src/index.ts'],
  outDir: './dist',
  outputOptions: { entryFileNames: 'simplify-x.user.js' },
  format: 'iife',

  dts: false,
  clean: true,

  plugins: [
    userScriptPlugin({
      name: "Simplify X",
      description: "Xの不要な機能と広告を非表示にします。x.com/settings以下から設定を変更できます。",
      runAt: "document-start",
      grant: [
        "GM_addStyle",
        "GM_getValue",
        "GM_setValue",
      ],
      match: [
        'https://x.com/*',
        'https://twitter.com/*'
      ],

      downloadURL: 'https://amasecocoa.github.io/simplify-x/simplify-x.user.js',
      updateURL: 'https://amasecocoa.github.io/simplify-x/simplify-x.user.js'
    }),
  ],
});
