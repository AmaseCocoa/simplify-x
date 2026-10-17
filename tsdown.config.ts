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
      description: "Xの不要な機能と広告を非表示にします。Xの設定画面から即時設定できます。",
      runAt: "document-start",
      grant: [
        "GM_addStyle",
        "GM_getValue",
        "GM_setValue",
      ],
      match: [
        'https://x.com/*',
        'https://twitter.com/*'
      ]
    }),
  ],
});
