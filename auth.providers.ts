export const SOCIAL_PROVIDERS = ['kakao', 'naver', 'google'] as const;
export type SocialProvider = (typeof SOCIAL_PROVIDERS)[number];

export function configuredSocialProviders(
  env: Record<string, string | undefined> = process.env,
): SocialProvider[] {
  return SOCIAL_PROVIDERS.filter(provider => {
    const prefix = `AUTH_${provider.toUpperCase()}`;
    return !!env[`${prefix}_ID`]?.trim() && !!env[`${prefix}_SECRET`]?.trim();
  });
}

export function safeReturnPath(value?: unknown): string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\u0000-\u001f]/.test(value)
  )
    return '/my-page';
  try {
    const url = new URL(value, 'https://nijoow.invalid');
    const decoded = decodeURIComponent(url.pathname);
    if (
      url.origin !== 'https://nijoow.invalid' ||
      decoded.startsWith('//') ||
      /[\\\u0000-\u001f]/.test(decoded)
    )
      return '/my-page';
    return url.pathname + url.search + url.hash;
  } catch {
    return '/my-page';
  }
}
