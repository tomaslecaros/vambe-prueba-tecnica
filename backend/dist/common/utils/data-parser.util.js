"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMeetingDate = parseMeetingDate;
exports.parseClosedValue = parseClosedValue;
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