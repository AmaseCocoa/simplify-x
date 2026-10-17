# Simplify X

Xの不要な機能や広告を非表示にするユーザースクリプトです。
Xの設定画面の「Simplify X」から表示項目を変更できます。

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
| `src/options.json` | 設定キー、表示名、説明文、CSSセレクターの静的定義 |
| `src/options.ts` | JSON定義の型チェックと設定キーの共有 |
| `src/settings.ts` | 設定の読込・補完・保存 |
| `src/modules/styles.ts` | 有効な設定から非表示CSSを生成 |
| `src/modules/ads.ts` | 広告の判定、マークの更新、再走査 |
| `src/modules/settings-page.ts` | Xの設定画面へのリンク挿入・表示切替・復元 |
| `src/modules/settings-view.ts` | 設定画面のHTML・CSSとチェックボックスの描画 |
| `src/globals.d.ts` | 使用するユーザースクリプトAPIの型宣言 |
| `plugins/userScript.ts` | ユーザースクリプトのメタデータ生成 |
| `tsdown.config.ts` | 単一のIIFEファイルへのビルド設定 |

非表示項目を追加するときは `src/options.json` に設定キーと表示名・説明文・セレクターを追加します。設定キーは型として共有され、説明文の不足は型チェックで検出されます。CSSだけでは判定できない広告の処理は `src/modules/ads.ts` にあります。

保存キー `xHiderSettings` は移行前と同じです。無効化済みの項目と未知の設定キーは保持し、新規項目は既定で有効になります。バージョンなどの配布情報は `package.json`、対象URLや権限は `tsdown.config.ts` で管理します。

元のルート直下のJavaScriptは `src/` に移行しました。生成ファイルを直接編集せず、TypeScriptを変更して再ビルドしてください。

## LP / Simplify X Lite

```sh
pnpm build:site    # UserScriptと静的サイトをビルド → site-dist/
pnpm preview:site  # http://127.0.0.1:4173
```

LPはUserScript版の導入リンクと、選択式のカスタムCSSジェネレーターを提供します。Liteはブラウザー内でCSSを生成し、選択内容をローカルに保存します。選択項目を外部に送信しません。

- 通常のCSS: カスタムCSS機能へ貼り付け、適用先を `x.com` と `twitter.com` に限定してください。
- Stylus用 UserCSS: 対象ドメインとメタデータを含む `.user.css` を生成します。Chrome系ではStylus管理画面へドラッグ＆ドロップ、Firefoxではファイルをブラウザーで開いて登録します。[Stylusの公式手順](https://github.com/openstyles/stylus/wiki/Writing-UserCSS#installing-local-files)も参照してください。
- **更新は手動**です。このページで再生成し、適用済みのCSSを置き換えてください。自動更新URLは含めません。
- LiteはCSSだけで動作し、UserScriptは不要です。Xの設定画面へのUI追加や広告のDOM判定は含みません。広告設定は広告サービスへのリンクのみが対象です。
- Xの仕様変更や `:has()` の対応状況により、一部のルールが動作しない場合があります。

`src/options.json` の `selectors` はUserScript / Lite共通のCSSです。UserScriptのDOM判定に依存するCSSは `scriptSelectors` に分けます。`liteDescription` を指定するとLite向けの説明と「一部対応」ラベルを表示できます。定義の更新は次回のサイトビルドで反映されます。

| ファイル | 役割 |
| --- | --- |
| `site/index.html` / `site/style.css` | LPとLiteの画面 |
| `site/main.ts` | 項目選択・保存・コピー・ダウンロード |
| `src/lite/css.ts` | CSS / UserCSSの生成 |
| `tsdown.site.config.ts` / `scripts/build-site.mjs` | 静的サイトと配布物のビルド |
| `.github/workflows/pages.yml` | 検証・GitHub Pagesへの自動公開 |

## GitHub Pagesへの公開

リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定してください。

`main`へのpushで型チェック・テスト・サイトビルドを実行し、成功すると `site-dist/` をGitHub Pagesへ公開します。Actionsの「Deploy GitHub Pages」から手動実行もできます。PRでは検証とビルドだけを実行し、公開しません。

相対URLでアセットとUserScriptを参照するため、プロジェクトのサブパス（例: `/simplify-x/`）にも対応します。公開したLPには、同じビルドの `simplify-x.user.js` が含まれます。

公開先はActionsのdeployジョブのURLで確認できます。ローカルビルドの成功だけでは、GitHub Pagesへの公開完了を意味しません。

## 開発方針と免責

Simplify Xは、作者自身の利便性のために作成した個人用ツールを公開しているものです。
ブロック対象の特定などのタスクや、tsdownの構成を除き、開発にはGPT-6.1 Solを使用しています。

すべての環境での動作を保証するものではありません。利用はご自身の判断でお願いします。

## Xの表示言語への対応

`src/i18n.json` で言語ごとの**セレクター全体を配列として**管理します。現在は日本語 (`ja`) を定義しています。`src/options.json` の `selectors` には共通セレクターの文字列と、`{ "i18n": "recommendedUsers" }` のような参照を混在できます。

ラベルの文字列置換は行いません。各言語で `=`（完全一致）、`*=`（部分一致）、`^=`（前方一致）、`$=`（後方一致）を自由に指定でき、属性名やDOM構造も変えられます。1つの参照に複数の候補を追加すると、それぞれ独立したCSSルールとして出力します。たとえば言語による単数形・複数形の差も別々の候補として定義できます。

以下は定義形式の例です（実際のDOMに合わせて調整してください）。

```json
{
  "ja": {
    "name": "日本語",
    "selectors": {
      "example": ["button[aria-label=\"日本語のラベル\"]"]
    }
  },
  "en": {
    "name": "English",
    "selectors": {
      "example": [
        "button[aria-label*=\"English label\"]",
        "div:has(> button[aria-label^=\"Alternative label\"])"
      ]
    }
  }
}
```

言語ごとに対象のルールを出力したくない場合は空配列 `[]` を指定します。共通セレクターは維持されます。重複した候補は除去され、存在しない参照キーはエラーになります。UserScriptとLiteは同じ展開処理を使い、Liteには `scriptSelectors` を含めません。

UserScriptは `html[lang]` を参照し、言語属性が変わるとCSSを再生成します。document-start時など属性がない間はブラウザーの言語を使います。地域付きコード（`en-US` など）は基本言語に正規化し、未対応の言語は日本語へフォールバックします。

Liteでは「Xの表示言語」を選択できます。選択した言語は項目・出力形式と一緒にブラウザーへ保存され、通常CSS・Stylus用の両方に反映されます。Xの表示言語を変更した場合は、CSSを再生成して適用し直してください。LPやUserScript設定画面のUIの翻訳は対象外です。

言語の追加は `src/i18n.json` に同じセレクターキーを持つ定義を追加します。X側の実際のaria-labelと一致する必要があるため、翻訳文ではなく対象DOMの値を確認してください。追加した言語の定義は、対象言語のX実環境で動作を確認してください。

### 未対応言語の警告

UserScriptの設定画面では、検出した `lang` が `src/i18n.json` の対応言語に含まれない場合に警告を表示します。検出値、一部の機能が正常に動作しない可能性、使用するフォールバック言語を表示し、言語コード入りのGitHub Issue作成画面へ案内します。Issueの投稿は利用者が行います。

設定画面を開いたまま言語が変わった場合も警告を更新し、対応言語になった場合は非表示にします。地域付きコードは基本言語で判定します。現在の定義は日本語のみで、未対応言語では日本語のセレクターを使用します。
