"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceManager = void 0;
const header_js_1 = require("./message/header.js");
class DeviceManager {
    transport;
    devices = new Map();
    constructor(options) {
        this.transport = options.transport;
    }
    addDevice(device) {
        this.devices.set(device.id, device);
    }
    removeDevice(device) {
        this.devices.delete(device.id);
    }
    removeDeviceById(deviceId) {
        this.devices.delete(deviceId);
    }
    getDevices() {
        return this.devices;
    }
    getDeviceById(deviceId) {
        return this.devices.get(deviceId);
    }
    async sendMessageToDevice(deviceOrId, message) {
        let device = deviceOrId;
        if (typeof deviceOrId === 'string') {
            device = this.getDeviceById(deviceOrId);
            if (!device) {
                throw new Error(`Device with ID ${deviceOrId} not found`);
            }
        }
        const shouldEncrypt = this.shouldEncryptMessage(device, message);
        return this.transport.send({
            message,
            encryptionKey: shouldEncrypt
                ? device.encryptionKeys?.sharedKey
                : undefined,
        });
    }
    shouldEncryptMessage(device, message) {
        const hasAbility = device.hasAbility(header_js_1.Namespace.ENCRYPT_ECDHE);
        const excludedNamespaces = [
            header_js_1.Namespace.SYSTEM_ALL,
            header_js_1.Namespace.SYSTEM_FIRMWARE,
            header_js_1.Namespace.SYSTEM_ABILITY,
            header_js_1.Namespace.ENCRYPT_ECDHE,
            header_js_1.Namespace.ENCRYPT_SUITE,
        ];
        return hasAbility && !excludedNamespaces.includes(message.namespace);
    }
}
exports.DeviceManager = DeviceManager;
