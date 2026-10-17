# Simplify X

Xの不要な機能や広告を非表示にするユーザースクリプトです。
Xの設定画面、またはユーザースクリプト管理拡張のメニューから表示項目を変更できます。

## 開発

```sh
pnpm install
pnpm build
```

生成される `dist/simplify-x.user.js` をTampermonkeyなどのユーザースクリプト管理拡張にインストールしてください。対象は `https://x.com/*` と `https://twitter.com/*` です。

```sh
pnpm dev        # ファイル変更時に再ビルド
pnpm typecheck  # ソース・テスト・ビルド設定の型チェック
pnpm test       # テストを一度実行
```

## 構成

| ファイル | 役割 |
| --- | --- |
| `src/index.ts` | 初期化とDOM変更の監視 |
| `src/options.ts` | 設定キー、表示名、CSSセレクター、説明文 |
| `src/settings.ts` | 設定の読込・補完・保存 |
| `src/modules/styles.ts` | 有効な設定から非表示CSSを生成 |
| `src/modules/ads.ts` | 広告の判定、マークの更新、再走査 |
| `src/modules/settings-page.ts` | Xの設定画面へのリンク挿入と設定UI |
| `src/globals.d.ts` | 使用するユーザースクリプトAPIの型宣言 |
| `plugins/userScript.ts` | ユーザースクリプトのメタデータ生成 |
| `tsdown.config.ts` | 単一のIIFEファイルへのビルド設定 |

非表示項目を追加するときは `src/options.ts` の `options` と `descriptions` を編集します。設定キーは型として共有され、説明文の不足は型チェックで検出されます。CSSだけでは判定できない広告の処理は `src/modules/ads.ts` にあります。

保存キー `xHiderSettings` は移行前と同じです。無効化済みの項目と未知の設定キーは保持し、新規項目は既定で有効になります。バージョンなどの配布情報は `package.json`、対象URLや権限は `tsdown.config.ts` で管理します。

元のルート直下のJavaScriptは `src/` に移行しました。生成ファイルを直接編集せず、TypeScriptを変更して再ビルドしてください。
