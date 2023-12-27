"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = encode;
exports.decode = decode;
const node_buffer_1 = require("node:buffer");
function encode(data) {
    if (typeof data === 'string') {
        data = node_buffer_1.Buffer.from(data, 'utf-8');
    }
    return data.toString('base64');
}
function decode(data) {
    return node_buffer_1.Buffer.from(data, 'base64');
}
exports.default = {
    encode,
    decode,
};
