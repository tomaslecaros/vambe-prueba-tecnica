/**
 * Fixes UTF-8 encoding issues where text was incorrectly decoded as Latin-1
 * Example: "TiburÃ³n" -> "Tiburón"
 */
export function fixUtf8Encoding(text: string): string {
  if (!text || typeof text !== 'string') return text;

  try {
    // Check if the string contains the typical UTF-8 misinterpretation pattern
    // These patterns appear when UTF-8 bytes are read as Latin-1
    const hasEncodingIssue = /[\xC2-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}/.test(text) ||
      text.includes('Ã') || text.includes('Â');

    if (hasEncodingIssue) {
      // Convert from Latin-1 back to UTF-8
      const bytes = Buffer.from(text, 'latin1');
      const fixed = bytes.toString('utf8');

      // Verify the result is valid (doesn't contain replacement characters)
      if (!fixed.includes('\uFFFD')) {
        return fixed;
      }
    }

    return text;
  } catch {
    return text;
  }
}

/**
 * Applies encoding fix to all string values in an object
 */
export function fixRowEncoding(row: Record<string, any>): Record<string, any> {
  const fixedRow: Record<string, any> = {};

  for (const [key, value] of Object.entries(row)) {
    const fixedKey = fixUtf8Encoding(key);
    fixedRow[fixedKey] = typeof value === 'string' ? fixUtf8Encoding(value) : value;
  }

  return fixedRow;
}

export function parseMeetingDate(dateValue: any): Date {
  if (dateValue instanceof Date) {
    return dateValue;
  }

  if (typeof dateValue === 'number') {
    const excelEpoch = new Date(1900, 0, 1);
    const daysOffset = dateValue - 2;
    return new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);
  }

  return new Date(dateValue);
}

export function parseClosedValue(closedValue: any): boolean {
  if (typeof closedValue === 'boolean') {
    return closedValue;
  }

  if (typeof closedValue === 'string') {
    return closedValue.toUpperCase() === 'TRUE';
  }

  return Boolean(closedValue);
}
