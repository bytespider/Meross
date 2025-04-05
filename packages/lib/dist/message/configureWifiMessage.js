"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigureWifiMessage = void 0;
const utils_1 = require("../utils");
const base64_1 = __importDefault(require("../utils/base64"));
const header_1 = require("./header");
const message_1 = require("./message");
class ConfigureWifiMessage extends message_1.Message {
    constructor(options) {
        const { payload = {}, header = {}, wifiAccessPoint } = options;
        const wifi = (0, utils_1.filterUndefined)(wifiAccessPoint);
        if (wifi.ssid) {
            wifi.ssid = base64_1.default.encode(Buffer.from(wifi.ssid));
        }
        if (wifi.password) {
            wifi.password = base64_1.default.encode(wifi.password);
        }
        super({
            payload: {
                wifi,
                ...payload,
            },
            header: {
                method: header_1.Method.SET,
                namespace: header_1.Namespace.CONFIG_WIFI,
                ...header,
            },
        });
    }
}
exports.ConfigureWifiMessage = ConfigureWifiMessage;
exports.default = ConfigureWifiMessage;
