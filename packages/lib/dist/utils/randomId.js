"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomId = randomId;
function randomId() {
    return crypto.randomUUID().replaceAll('-', '');
}
exports.default = randomId;
