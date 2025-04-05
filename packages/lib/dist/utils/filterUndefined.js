"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterUndefined = filterUndefined;
function filterUndefined(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== undefined));
}
