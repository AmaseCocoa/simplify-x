export const options = {
    hideCalls: ['通話 (Calls)', ['a[href="/i/calls"]']],
    hideCreators: ['クリエイターStudio', ['a[href="/i/jf/creators/studio"]']],
    hidePremium: ['プレミアム関連', ['a[href="/i/premium_sign_up"]', 'aside[aria-label="プレミアムにサブスクライブ"]', 'div:has(> div > a[href="/i/premium_sign_up"])']],
    hideGrok: ['Grok関連', ['a[href="/i/grok"]', 'button[aria-label="Grok"]', 'button[aria-label="Grokのアクション"]', 'a[href^="/i/grok-redirect"]']],
    hideAds: ['広告（トレンド・ポスト・広告リンク）', ['a[href="https://ads.x.com/?ref=gl-tw-tw-twitter-ads-rweb"]']],
    hideVerifiedOrgs: ['認証組織', ['a[href="/i/verified-orgs-signup"]']],
    hideImagine: ['Imagine画像編集', ['div:has(> div > div > span[content="Imagineで画像を編集"])']]
} as const;

export type OptionKey = keyof typeof options;
export const optionKeys = Object.keys(options) as OptionKey[];

export const descriptions: Record<OptionKey, string> = {
    hideCalls: 'サイドバーの通話へのリンク',
    hideCreators: 'サイドバーのクリエイタースタジオ',
    hidePremium: '登録への案内やサブスクリプションのおすすめ',
    hideGrok: 'Grokへのリンクと関連ボタン',
    hideAds: 'トレンド広告、ポストの広告、広告サービスへのリンク',
    hideVerifiedOrgs: '認証組織への登録リンク',
    hideImagine: 'Imagineで画像を編集する案内',
};
