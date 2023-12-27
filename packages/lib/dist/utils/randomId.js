"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomId = randomId;
const node_crypto_1 = require("node:crypto");
function randomId() {
    return (0, node_crypto_1.randomUUID)().replaceAll('-', '');
}
exports.default = randomId;
