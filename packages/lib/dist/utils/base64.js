"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = encode;
exports.decode = decode;
function encode(data) {
    return data.toString('base64');
}
function decode(data) {
    return Buffer.from(data, 'base64');
}
exports.default = {
    encode,
    decode,
};
