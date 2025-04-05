"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeDevicePassword = computeDevicePassword;
const md5_1 = require("./md5");
function computeDevicePassword(macAddress, key = '', userId = 0) {
    const hash = (0, md5_1.md5)(`${macAddress}${key}`, 'hex');
    return `${userId}_${hash}`;
}
exports.default = computeDevicePassword;
