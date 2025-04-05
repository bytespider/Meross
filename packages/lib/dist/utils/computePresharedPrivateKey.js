"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePresharedPrivateKey = computePresharedPrivateKey;
const base64_js_1 = __importDefault(require("./base64.js"));
const md5_js_1 = __importDefault(require("./md5.js"));
/**
 * Computes the preshared private key for a device using its UUID, a shared key, and its MAC address.
 * Really shouldn't need this with ECDH key exchange but here we are.
 */
function computePresharedPrivateKey(uuid, key, macAddress) {
  return base64_js_1.default.encode((0, md5_js_1.default)(`${uuid.slice(3, 22)}${key.slice(1, 9)}${macAddress}${key.slice(10, 28)}`, 'hex'));
}
exports.default = computePresharedPrivateKey;
