const WORD_LIMIT = 30;

export function truncateWords(text: string, limit: number = WORD_LIMIT): string {
  if (!text || typeof text !== 'string') return '';
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= limit) return text.trim();
  return words.slice(0, limit).join(' ') + '…';
}

/** Truncate to max characters with ellipsis (e.g. 20 chars for table cells) */
export function truncateChars(text: string, max: number = 20): string {
  if (!text || typeof text !== 'string') return '';
  const t = text.trim();
  if (t.length <= max) return t;
  return t.slice(0, max) + '…';
}
