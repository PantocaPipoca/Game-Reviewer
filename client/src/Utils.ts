// Since avatars come from a different source, we need to saitize
// it could become a XSS vector if not sanitized
export function sanitizeImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    try {
        const parsed = new URL(url);
        if (["https:", "http:"].includes(parsed.protocol)) {
            return url;
        }
    } catch {}
    return null;
}
