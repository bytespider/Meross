"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTimestamp = generateTimestamp;
function generateTimestamp() {
    return Math.round(Date.now() / 1000);
}
