
/**
 * Sanitizes a string by removing all null characters and trimming it
 * @param value the string to sanitize
 * @returns the sanitized string
 */
export function sanitizeString(value: string): string {
    return value.replace(/\x00/g, '').trim();
}