import { detectPageLanguage, isSupportedLanguage, languageNames, resolveLanguage } from '../i18n';

export function languageWarning(language: string): { message: string; issueUrl: string } | undefined {
    if (isSupportedLanguage(language)) return;

    const detected = language || 'unknown';
    const fallback = languageNames[resolveLanguage(language)];
    const issueUrl = new URL('https://github.com/AmaseCocoa/simplify-x/issues/new');
    issueUrl.searchParams.set('title', `Language Request: ${detected}`);
    issueUrl.searchParams.set('body', `Detected lang: ${detected}\n\nBroken features:\n\n`);

    if (detected === 'unknown') {
        return {
            message: `Failed to detect language (${detected}) and fallback to ${fallback}. some features may not work properly.`,
            issueUrl: issueUrl.href,
        };
    }

    return {
        message: `Unsupported language (${detected}) detected and fallback to ${fallback}. some features may not work properly.. please create issue to get language support.`,
        issueUrl: issueUrl.href,
    };
}

export function updateLanguageWarning(shadow: ShadowRoot): void {
    const warning = shadow.getElementById('language-warning');
    if (!warning) return;

    const content = languageWarning(detectPageLanguage());
    if (!content) {
        if (!warning.hidden) warning.hidden = true;
        return;
    }

    const message = warning.querySelector('p')!;
    const link = warning.querySelector('a')!;
    if (message.textContent !== content.message) message.textContent = content.message;
    if (link.href !== content.issueUrl) link.href = content.issueUrl;
    if (warning.hidden) warning.hidden = false;
}
