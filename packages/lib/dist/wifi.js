"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WifiAccessPoint = exports.WifiEncryption = exports.WifiCipher = void 0;
exports.encryptPassword = encryptPassword;
const encryption_js_1 = __importDefault(require("./encryption.js"));
const md5_js_1 = __importDefault(require("./utils/md5.js"));
var WifiCipher;
(function (WifiCipher) {
    WifiCipher[WifiCipher["NONE"] = 0] = "NONE";
    WifiCipher[WifiCipher["WEP"] = 1] = "WEP";
    WifiCipher[WifiCipher["TKIP"] = 2] = "TKIP";
    WifiCipher[WifiCipher["AES"] = 3] = "AES";
    WifiCipher[WifiCipher["TIKPAES"] = 4] = "TIKPAES";
})(WifiCipher || (exports.WifiCipher = WifiCipher = {}));
var WifiEncryption;
(function (WifiEncryption) {
    WifiEncryption[WifiEncryption["OPEN"] = 0] = "OPEN";
    WifiEncryption[WifiEncryption["SHARE"] = 1] = "SHARE";
    WifiEncryption[WifiEncryption["WEPAUTO"] = 2] = "WEPAUTO";
    WifiEncryption[WifiEncryption["WPA1"] = 3] = "WPA1";
    WifiEncryption[WifiEncryption["WPA1PSK"] = 4] = "WPA1PSK";
    WifiEncryption[WifiEncryption["WPA2"] = 5] = "WPA2";
    WifiEncryption[WifiEncryption["WPA2PSK"] = 6] = "WPA2PSK";
    WifiEncryption[WifiEncryption["WPA1WPA2"] = 7] = "WPA1WPA2";
    WifiEncryption[WifiEncryption["WPA1PSKWPA2PS"] = 8] = "WPA1PSKWPA2PS";
})(WifiEncryption || (exports.WifiEncryption = WifiEncryption = {}));
async function encryptPassword(options) {
    const { password, hardware } = options;
    const { type, uuid, macAddress } = hardware;
    if (!password) {
        throw new Error('Password is required');
    }
    if (!type || !uuid || !macAddress) {
        throw new Error('Hardware information is required');
    }
    const key = Buffer.from((0, md5_js_1.default)(`${type}${uuid}${macAddress}`, 'hex'), 'utf-8');
    const data = Buffer.from(password, 'utf-8');
    return encryption_js_1.default.encrypt(data, key);
}
class WifiAccessPoint {
    ssid;
    bssid;
    channel;
    cipher;
    encryption;
    password;
    signal;
    constructor(options = {}) {
        const { ssid, bssid, channel, cipher, encryption, password, signal } = options;
        if (ssid?.length > 32) {
            throw new Error('SSID length exceeds 32 characters');
        }
        if (bssid?.length > 17) {
            throw new Error('BSSID length exceeds 17 characters');
        }
        if (password?.length > 64) {
            throw new Error('Password length exceeds 64 characters');
        }
        this.ssid = ssid;
        this.bssid = bssid;
        this.channel = channel;
        this.cipher = cipher;
        this.encryption = encryption;
        this.password = password;
        this.signal = signal;
    }
    isOpen() {
        return (this.encryption == WifiEncryption.OPEN && this.cipher == WifiCipher.NONE);
    }
    isWEP() {
        return (this.encryption == WifiEncryption.OPEN && this.cipher == WifiCipher.WEP);
    }
}
exports.WifiAccessPoint = WifiAccessPoint;
