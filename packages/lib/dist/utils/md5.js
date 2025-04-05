"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.md5 = md5;
const node_buffer_1 = require("node:buffer");
const node_crypto_1 = require("node:crypto");
function md5(data, encoding) {
  if (typeof data === 'string') {
    data = node_buffer_1.Buffer.from(data, 'utf-8');
  }
  const hash = (0, node_crypto_1.createHash)('md5').update(data);
  if (encoding === undefined) {
    return hash.digest();
  }
  return hash.digest(encoding);
}
exports.default = md5;
