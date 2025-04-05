"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Device = void 0;
const encryption_js_1 = require("./encryption.js");
const messages_js_1 = require("./message/messages.js");
const wifi_js_1 = require("./wifi.js");
const header_js_1 = require("./message/header.js");
const base64_js_1 = __importDefault(require("./utils/base64.js"));
const logger_js_1 = __importDefault(require("./utils/logger.js"));
const md5_js_1 = __importDefault(require("./utils/md5.js"));
const protocolFromPort_js_1 = __importDefault(require("./utils/protocolFromPort.js"));
const deviceLogger = logger_js_1.default.child({
    name: 'device',
});
const FirmwareDefaults = {
    version: '0.0.0',
    compileTime: new Date(),
};
const HardwareDefaults = {
    version: '0.0.0',
    uuid: '00000000000000000000000000000000',
    macAddress: '00:00:00:00:00:00',
};
class Device {
    firmware;
    hardware;
    model;
    ability = {};
    encryptionKeys = {
        localKeys: undefined,
        remotePublicKey: undefined,
        sharedKey: undefined,
    };
    transport;
    constructor(options = {}) {
        const { firmware, hardware, model } = options;
        this.firmware = firmware || FirmwareDefaults;
        this.hardware = hardware || HardwareDefaults;
        this.model = model;
    }
    get id() {
        return this.hardware.uuid;
    }
    setTransport(transport) {
        deviceLogger.debug(`Setting transport for device ${this.id} to ${transport.constructor.name}`, { transport });
        this.transport = transport;
    }
    async setPrivateKey(privateKey) {
        deviceLogger.debug(`Setting private key for device ${this.id}`);
        const keyPair = await (0, encryption_js_1.createKeyPair)(privateKey);
        this.encryptionKeys.localKeys = keyPair;
    }
    hasAbility(ability) {
        deviceLogger.debug(`Checking if device ${this.id} has ability ${ability}`, {
            ability,
        });
        return Object.keys(this.ability).includes(ability);
    }
    sendMessage(message) {
        return this.transport.send({
            message,
            encryptionKey: this.encryptionKeys.sharedKey,
        });
    }
    async fetchDeviceInfo() {
        deviceLogger.info(`Fetching device information for ${this.id}`);
        const message = new messages_js_1.QueryDeviceInformationMessage();
        const { payload: { all }, } = await this.sendMessage(message);
        const { system: { firmware = FirmwareDefaults, hardware = HardwareDefaults }, } = all;
        this.model = hardware?.type;
        deviceLogger.info(`Device Info - Model: ${this.model}, Firmware: ${firmware?.version}, Hardware: ${hardware?.version}, UUID: ${hardware?.uuid}, MAC Address: ${hardware?.macAddress}`);
        this.firmware = {
            version: firmware?.version,
            compileTime: firmware?.compileTime
                ? new Date(firmware?.compileTime)
                : undefined,
        };
        this.hardware = {
            version: hardware?.version,
            uuid: hardware?.uuid,
            macAddress: hardware?.macAddress,
        };
        return all;
    }
    async fetchDeviceAbilities() {
        deviceLogger.info(`Fetching device abilities for ${this.id}`);
        const message = new messages_js_1.QueryDeviceAbilitiesMessage();
        const { payload: { ability }, } = await this.sendMessage(message);
        this.ability = ability;
        deviceLogger.info(`Device Abilities: ${JSON.stringify(this.ability)}`);
        return ability;
    }
    async fetchDeviceTime() {
        const message = new messages_js_1.QueryDeviceTimeMessage();
        const { payload: { time }, } = await this.sendMessage(message);
        return time;
    }
    async exchangeKeys() {
        deviceLogger.info(`Exchanging keys for device ${this.id}`);
        if (!this.encryptionKeys.localKeys) {
            deviceLogger.debug(`Generating local keys for device ${this.id}`);
            this.encryptionKeys.localKeys = await (0, encryption_js_1.generateKeyPair)();
        }
        const { publicKey, privateKey } = this.encryptionKeys.localKeys;
        const message = new messages_js_1.ConfigureECDHMessage({ publicKey });
        const { payload: { ecdhe: { pubkey }, }, } = await this.sendMessage(message);
        const remotePublicKey = Buffer.from(pubkey, 'base64');
        this.encryptionKeys.remotePublicKey = remotePublicKey;
        // derive the shared key
        const sharedKey = await (0, encryption_js_1.deriveSharedKey)(privateKey, remotePublicKey);
        // ...and now for the dumb part
        // Meross take the shared key and MD5 it
        const sharedKeyMd5 = await (0, md5_js_1.default)(sharedKey, 'hex');
        // then use the 32 hex characters as the shared key
        this.encryptionKeys.sharedKey = Buffer.from(sharedKeyMd5, 'utf8');
        return;
    }
    async configureDeviceTime(timestamp, timezone = undefined) {
        deviceLogger.info(`Configuring system time for device ${this.id} with timestamp ${timestamp} and timezone ${timezone}`);
        const message = new messages_js_1.ConfigureDeviceTimeMessage({
            timestamp,
            timezone,
        });
        await this.sendMessage(message);
        return;
    }
    async configureMQTTBrokersAndCredentials(mqtt, credentials) {
        deviceLogger.info(`Configuring MQTT brokers and credentials for device ${this.id}`);
        const brokers = mqtt
            .map((broker) => {
            if (!URL.canParse(broker)) {
                // do we have a port?
                const port = broker.split(':')[1];
                if (port) {
                    const protocol = (0, protocolFromPort_js_1.default)(Number(port));
                    broker = `${protocol}://${broker}`;
                }
            }
            let { hostname, port } = new URL(broker);
            return {
                host: hostname,
                port: Number(port),
            };
        })
            .slice(0, 2); // Limit to 2 brokers
        const message = new messages_js_1.ConfigureMQTTBrokersAndCredentialsMessage({
            mqtt: brokers,
            credentials: credentials,
        });
        await this.sendMessage(message);
        return;
    }
    async fetchNearbyWifi() {
        deviceLogger.info(`Fetching nearby WiFi for device ${this.id}`);
        const message = new messages_js_1.QueryWifiListMessage();
        const { payload: { wifiList }, } = await this.sendMessage(message);
        return wifiList.map((item) => new wifi_js_1.WifiAccessPoint({
            ...item,
            ssid: item.ssid
                ? base64_js_1.default.decode(item.ssid).toString('utf-8')
                : undefined,
        }));
    }
    async configureWifi(wifiAccessPoint) {
        deviceLogger.info(`Configuring WiFi for device ${this.id} with SSID ${wifiAccessPoint.ssid}`);
        let message = new messages_js_1.ConfigureWifiMessage({ wifiAccessPoint });
        if (this.hasAbility(header_js_1.Namespace.CONFIG_WIFIX)) {
            deviceLogger.debug(`Device ${this.id} has CONFIG_WIFIX ability, using ConfigureWifiXMessage`);
            wifiAccessPoint.password = await (0, wifi_js_1.encryptPassword)({
                password: wifiAccessPoint.password,
                hardware: { type: this.model, ...this.hardware },
            });
            message = new messages_js_1.ConfigureWifiXMessage({
                wifiAccessPoint,
            });
        }
        await this.sendMessage(message);
        return true;
    }
}
exports.Device = Device;
