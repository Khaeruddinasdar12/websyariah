/** Public production domain — never use *.vercel.app for OG/canonical. */
export const PRODUCTION_SITE_URL = 'https://syariah.iain-bone.ac.id';

function normalizePublicSiteUrl(raw: string | undefined | null): string | null {
  if (!raw?.trim()) return null;
  const withProtocol = raw.trim().startsWith('http')
    ? raw.trim()
    : `https://${raw.trim()}`;

  try {
    const url = new URL(withProtocol);
    // Preview / deployment hosts break WhatsApp OG (image URL ≠ shared page domain).
    if (url.hostname.endsWith('.vercel.app')) return null;
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return process.env.NODE_ENV === 'development'
        ? withProtocol.replace(/\/$/, '')
        : null;
    }
    return withProtocol.replace(/\/$/, '');
  } catch {
    return null;
  }
}

/**
 * Canonical public site origin for Open Graph, WhatsApp, and absolute links.
 * Never falls back to VERCEL_URL (that is often a temporary *.vercel.app host).
 */
export function getSiteUrl(): string {
  return (
    normalizePublicSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : PRODUCTION_SITE_URL)
  );
}
