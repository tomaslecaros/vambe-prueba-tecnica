"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixUtf8Encoding = fixUtf8Encoding;
exports.fixRowEncoding = fixRowEncoding;
exports.parseMeetingDate = parseMeetingDate;
exports.parseClosedValue = parseClosedValue;
function fixUtf8Encoding(text) {
    if (!text || typeof text !== 'string')
        return text;
    try {
        const hasEncodingIssue = /[\xC2-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}/.test(text) ||
            text.includes('Ã') || text.includes('Â');
        if (hasEncodingIssue) {
            const bytes = Buffer.from(text, 'latin1');
            const fixed = bytes.toString('utf8');
            if (!fixed.includes('\uFFFD')) {
                return fixed;
            }
        }
        return text;
    }
    catch {
        return text;
    }
}
function fixRowEncoding(row) {
    const fixedRow = {};
    for (const [key, value] of Object.entries(row)) {
        const fixedKey = fixUtf8Encoding(key);
        fixedRow[fixedKey] = typeof value === 'string' ? fixUtf8Encoding(value) : value;
    }
    return fixedRow;
}
function parseMeetingDate(dateValue) {
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
function parseClosedValue(closedValue) {
    if (typeof closedValue === 'boolean') {
        return closedValue;
    }
    if (typeof closedValue === 'string') {
        return closedValue.toUpperCase() === 'TRUE';
    }
    return Boolean(closedValue);
}
//# sourceMappingURL=data-parser.util.js.map