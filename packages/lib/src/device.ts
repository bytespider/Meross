import { CloudCredentials } from './cloudCredentials.js';
import {
  createKeyPair,
  deriveSharedKey,
  generateKeyPair,
  type EncryptionKeyPair,
} from './encryption.js';
import {
  ConfigureDeviceTimeMessage,
  ConfigureECDHMessage,
  ConfigureMQTTBrokersAndCredentialsMessage,
  ConfigureWifiMessage,
  ConfigureWifiXMessage,
  QueryDeviceAbilitiesMessage,
  QueryDeviceInformationMessage,
  QueryDeviceTimeMessage,
  QueryWifiListMessage,
} from './message/messages.js';
import { encryptPassword, WifiAccessPoint } from './wifi.js';
import { Namespace } from './message/header.js';
import { Transport } from './transport/transport.js';
import base64 from './utils/base64.js';
import logger from './utils/logger.js';
import md5 from './utils/md5.js';
import {
  protocolFromPort,
  portFromProtocol,
} from './utils/protocolFromPort.js';

const deviceLogger = logger.child({
  name: 'device',
});

export type MacAddress =
  `${string}:${string}:${string}:${string}:${string}:${string}`;
export type UUID = string;

export type DeviceFirmware = {
  version: string;
  compileTime: Date;
};

const FirmwareDefaults: DeviceFirmware = {
  version: '0.0.0',
  compileTime: new Date(),
};

export type DeviceHardware = {
  version?: string;
  uuid: UUID;
  macAddress: MacAddress;
};

const HardwareDefaults: DeviceHardware = {
  version: '0.0.0',
  uuid: '00000000000000000000000000000000',
  macAddress: '00:00:00:00:00:00',
};

export type EncryptionKeys = {
  localKeys: EncryptionKeyPair | undefined;
  remotePublicKey: Buffer | undefined;
  sharedKey: Buffer | undefined;
};

export type DeviceOptions = {
  firmware?: DeviceFirmware;
  hardware?: DeviceHardware;
  model?: string;
};

export class Device implements Device {
  firmware: DeviceFirmware;
  hardware: DeviceHardware;
  model?: string;

  ability: Record<string, any> = {};

  encryptionKeys: EncryptionKeys = {
    localKeys: undefined,
    remotePublicKey: undefined,
    sharedKey: undefined,
  };

  protected transport: Transport;

  constructor(options: DeviceOptions = {}) {
    const { firmware, hardware, model } = options;
    this.firmware = firmware || FirmwareDefaults;
    this.hardware = hardware || HardwareDefaults;
    this.model = model;
  }

  get id(): UUID {
    return this.hardware.uuid;
  }

  setTransport(transport: Transport) {
    deviceLogger.debug(
      `Setting transport for device ${this.id} to ${transport.constructor.name}`,
      { transport }
    );
    this.transport = transport;
  }

  async setPrivateKey(privateKey: Buffer) {
    deviceLogger.debug(`Setting private key for device ${this.id}`);

    const keyPair = await createKeyPair(privateKey);

    this.encryptionKeys.localKeys = keyPair;
  }

  hasAbility(ability: Namespace) {
    deviceLogger.debug(`Checking if device ${this.id} has ability ${ability}`, {
      ability,
    });
    return Object.keys(this.ability).includes(ability);
  }

  private sendMessage(message: any): Promise<Record<string, any>> {
    return this.transport.send({
      message,
      encryptionKey: this.encryptionKeys.sharedKey,
    });
  }

  async fetchDeviceInfo() {
    deviceLogger.info(`Fetching device information for ${this.id}`);
    const message = new QueryDeviceInformationMessage();
    const {
      payload: { all },
    } = await this.sendMessage(message);

    const {
      system: { firmware = FirmwareDefaults, hardware = HardwareDefaults },
    } = all;

    this.model = hardware?.type;
    deviceLogger.info(
      `Device Info - Model: ${this.model}, Firmware: ${firmware?.version}, Hardware: ${hardware?.version}, UUID: ${hardware?.uuid}, MAC Address: ${hardware?.macAddress}`
    );

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

    const message = new QueryDeviceAbilitiesMessage();
    const {
      payload: { ability },
    } = await this.sendMessage(message);

    this.ability = ability;

    deviceLogger.info(`Device Abilities: ${JSON.stringify(this.ability)}`);

    return ability;
  }

  async fetchDeviceTime() {
    const message = new QueryDeviceTimeMessage();
    const {
      payload: { time },
    } = await this.sendMessage(message);
    return time;
  }

  async exchangeKeys() {
    deviceLogger.info(`Exchanging keys for device ${this.id}`);

    if (!this.encryptionKeys.localKeys) {
      deviceLogger.debug(`Generating local keys for device ${this.id}`);
      this.encryptionKeys.localKeys = await generateKeyPair();
    }

    const { publicKey, privateKey } = this.encryptionKeys.localKeys;

    const message = new ConfigureECDHMessage({ publicKey });

    const {
      payload: {
        ecdhe: { pubkey },
      },
    } = await this.sendMessage(message);

    const remotePublicKey = Buffer.from(pubkey, 'base64');
    this.encryptionKeys.remotePublicKey = remotePublicKey;

    // derive the shared key
    const sharedKey = await deriveSharedKey(privateKey, remotePublicKey);

    // ...and now for the dumb part
    // Meross take the shared key and MD5 it
    const sharedKeyMd5 = await md5(sharedKey, 'hex');

    // then use the 32 hex characters as the shared key
    this.encryptionKeys.sharedKey = Buffer.from(sharedKeyMd5, 'utf8');

    return;
  }

  async configureDeviceTime(
    timestamp: number,
    timezone: string | undefined = undefined
  ) {
    deviceLogger.info(
      `Configuring system time for device ${this.id} with timestamp ${timestamp} and timezone ${timezone}`
    );

    const message = new ConfigureDeviceTimeMessage({
      timestamp,
      timezone,
    });

    await this.sendMessage(message);
    return;
  }

  async configureMQTTBrokersAndCredentials(
    mqtt: string[],
    credentials: CloudCredentials
  ) {
    deviceLogger.info(
      `Configuring MQTT brokers and credentials for device ${this.id}`
    );

    const brokers = mqtt
      .map((broker) => {
        if (!URL.canParse(broker)) {
          // do we have a port?
          const port = broker.split(':')[1];
          if (port) {
            const protocol = protocolFromPort(Number(port));
            broker = `${protocol}://${broker}`;
          }
        }

        let { protocol, hostname, port } = new URL(broker);
        if (!port) {
          port = `${portFromProtocol(protocol.replace(':', ''))}`;
        }

        return {
          host: hostname,
          port: Number(port),
        };
      })
      .slice(0, 2); // Limit to 2 brokers

    const message = new ConfigureMQTTBrokersAndCredentialsMessage({
      mqtt: brokers,
      credentials: credentials,
    });

    await this.sendMessage(message);
    return;
  }

  async fetchNearbyWifi(): Promise<WifiAccessPoint[]> {
    deviceLogger.info(`Fetching nearby WiFi for device ${this.id}`);

    const message = new QueryWifiListMessage();
    const {
      payload: { wifiList },
    } = await this.sendMessage(message);

    return wifiList.map(
      (item) =>
        new WifiAccessPoint({
          ...item,
          ssid: item.ssid
            ? base64.decode(item.ssid).toString('utf-8')
            : undefined,
        })
    );
  }

  async configureWifi(wifiAccessPoint: WifiAccessPoint): Promise<boolean> {
    deviceLogger.info(
      `Configuring WiFi for device ${this.id} with SSID ${wifiAccessPoint.ssid}`
    );

    let message = new ConfigureWifiMessage({ wifiAccessPoint });
    if (this.hasAbility(Namespace.CONFIG_WIFIX)) {
      deviceLogger.debug(
        `Device ${this.id} has CONFIG_WIFIX ability, using ConfigureWifiXMessage`
      );

      wifiAccessPoint.password = await encryptPassword({
        password: wifiAccessPoint.password,
        hardware: { type: this.model, ...this.hardware },
      });

      message = new ConfigureWifiXMessage({
        wifiAccessPoint,
      });
    }

    await this.sendMessage(message);
    return true;
  }

  // /**
  //  *
  //  * @param {Namespace} namespace
  //  * @param {object} [payload]
  //  * @returns {Promise<any>}
  //  */
  // async queryCustom(namespace, payload = {}) {
  //   const message = new Message();
  //   message.header.method = Method.GET;
  //   message.header.namespace = namespace;
  //   message.payload = payload;

  //   return this.#transport.send({
  //     message,
  //     signatureKey: this.credentials.key,
  //   });
  // }

  // /**
  //  *
  //  * @param {Namespace} namespace
  //  * @param {object} [payload]
  //  * @returns  {Promise<any>}
  //  */
  // async configureCustom(namespace, payload = {}) {
  //   const message = new Message();
  //   message.header.method = Method.SET;
  //   message.header.namespace = namespace;
  //   message.payload = payload;

  //   return this.#transport.send({
  //     message,
  //     signatureKey: this.credentials.key,
  //   });
  // }

  // /**
  //  * @typedef QuerySystemInformationResponse
  //  * @property {object} system
  //  * @property {QuerySystemFirmwareResponse} system.firmware
  //  * @property {QuerySystemHardwareResponse} system.hardware
  //  */
  // /**
  //  *
  //  * @param {boolean} [updateDevice]
  //  * @returns {Promise<QuerySystemInformationResponse>}
  //  */
  // async querySystemInformation(updateDevice = true) {
  //   const message = new QuerySystemInformationMessage();
  //   message.sign(this.credentials.key);

  //   const { payload } = await this.#transport.send({
  //     message,
  //     signatureKey: this.credentials.key,
  //   });

  //   const { all } = payload;

  //   if (updateDevice) {
  //     const {
  //       system: { firmware = FirmwareDefaults, hardware = HardwareDefaults },
  //     } = all;

  //     this.model = hardware?.type;
  //     this.firmware = {
  //       version: firmware?.version,
  //       compileTime: firmware?.compileTime
  //         ? new Date(firmware?.compileTime)
  //         : undefined,
  //     };
  //     this.hardware = {
  //       version: hardware?.version,
  //       macAddress: hardware?.macAddress,
  //     };
  //   }

  //   return all;
  // }

  // /**
  //  * @typedef QuerySystemFirmwareResponse
  //  * @property {string} version
  //  * @property {number} compileTime
  //  */
  // /**
  //  *
  //  * @param {boolean} [updateDevice]
  //  * @returns {Promise<QuerySystemFirmwareResponse>}
  //  */
  // async querySystemFirmware(updateDevice = true) {
  //   const message = new QuerySystemFirmwareMessage();

  //   const { payload } = await this.#transport.send({
  //     message,
  //     signatureKey: this.credentials.key,
  //   });

  //   const { firmware = FirmwareDefaults } = payload;

  //   if (updateDevice) {
  //     this.firmware = {
  //       version: firmware?.version,
  //       compileTime: firmware?.compileTime
  //         ? new Date(firmware?.compileTime)
  //         : undefined,
  //     };
  //   }

  //   return firmware;
  // }

  // /**
  //  * @typedef QuerySystemHardwareResponse
  //  * @property {string} version
  //  * @property {string} macAddress
  //  */
  // /**
  //  *
  //  * @param {boolean} [updateDevice]
  //  * @returns {Promise<QuerySystemHardwareResponse>}
  //  */
  // async querySystemHardware(updateDevice = true) {
  //   const message = new QuerySystemHardwareMessage();

  //   const { payload } = await this.#transport.send({
  //     message,
  //     signatureKey: this.credentials.key,
  //   });

  //   const { hardware = HardwareDefaults } = payload;

  //   if (updateDevice) {
  //     this.hardware = {
  //       version: hardware?.version,
  //       macAddress: hardware?.macAddress,
  //     };
  //   }

  //   return hardware;
  // }

  // /**
  //  *
  //  * @param {Namespace} ability
  //  * @param {boolean} [updateDevice]
  //  * @returns {Promise<boolean>}
  //  */
  // async hasSystemAbility(ability, updateDevice = true) {
  //   if (Object.keys(this.ability).length == 0 && updateDevice) {
  //     this.querySystemAbility(updateDevice);
  //   }

  //   return ability in this.ability;
  // }

  // /**
  //  * @typedef QuerySystemAbilityResponse
  //  */
  // /**
  //  *
  //  * @param {boolean} [updateDevice]
  //  * @returns {Promise<QuerySystemAbilityResponse>}
  //  */
  // async querySystemAbility(updateDevice = true) {
  //   const message = new QuerySystemAbilityMessage();

  //   const { payload } = await this.#transport.send({
  //     message,
  //     signatureKey: this.credentials.key,
  //   });

  //   const { ability } = payload;
  //   if (updateDevice) {
  //     this.ability = ability;
  //   }

  //   return ability;
  // }

  // /**
  //  * @typedef QuerySystemTimeResponse
  //  * @property {number} timestamp
  //  * @property {string} timezone
  //  */
  // /**
  //  *
  //  * @param {boolean} [updateDevice]
  //  * @returns {Promise<QuerySystemTimeResponse>}
  //  */
  // async querySystemTime(updateDevice = true) {
  //   const message = new QuerySystemTimeMessage();

  //   const { payload } = await this.#transport.send({
  //     message,
  //     signatureKey: this.credentials.key,
  //   });

  //   const { time } = payload;
  //   if (updateDevice) {
  //   }

  //   return time;
  // }

  // /**
  //  *
  //  * @param {object} [opts]
  //  * @param {number} [opts.timestamp]
  //  * @param {string} [opts.timezone]
  //  * @param {boolean} [updateDevice]
  //  * @returns {Promise<boolean>}
  //  */
  // async configureSystemTime({ timestamp, timezone } = {}, updateDevice = true) {
  //   const message = new ConfigureSystemTimeMessage({ timestamp, timezone });

  //   await this.#transport.send({ message, signatureKey: this.credentials.key });

  //   return true;
  // }

  // /**
  //  * @typedef QuerySystemGeolocationResponse
  //  */
  // /**
  //  *
  //  * @param {boolean} [updateDevice]
  //  * @returns {Promise<QuerySystemGeolocationResponse>}
  //  */
  // async querySystemGeolocation(updateDevice = true) {
  //   const message = new QuerySystemTimeMessage();

  //   const { payload } = await this.#transport.send({
  //     message,
  //     signatureKey: this.credentials.key,
  //   });

  //   const { position } = payload;
  //   if (updateDevice) {
  //   }

  //   return position;
  // }

  // /**
  //  * @param {object} [opts]
  //  * @param {} [opts.position]
  //  * @param {boolean} [updateDevice]
  //  * @returns {Promise<boolean>}
  //  */
  // async configureSystemGeolocation({ position } = {}, updateDevice = true) {
  //   const message = new ConfigureSystemPositionMessage({ position });

  //   await this.#transport.send({ message, signatureKey: this.credentials.key });

  //   return true;
  // }

  // /**
  //  *
  //  * @returns {Promise<WifiAccessPoint[]>}
  //  */
  // async queryNearbyWifi() {
  //   const message = new QueryNearbyWifiMessage();

  //   const { payload } = await this.#transport.send({
  //     message,
  //     signatureKey: this.credentials.key,
  //   });

  //   const { wifiList } = payload;

  //   return wifiList.map((item) => new WifiAccessPoint(item));
  // }

  // /**
  //  * @param { object } [opts]
  //  * @param { string[] } [opts.mqtt]
  //  * @returns { Promise<boolean> }
  //  */
  // async configureMQTTBrokers({ mqtt = [] } = {}) {
  //   const message = new ConfigureMQTTMessage({
  //     mqtt,
  //     credentials: this.credentials,
  //   });

  //   await this.#transport.send({
  //     message,
  //     signatureKey: this.credentials.key,
  //   });

  //   return true;
  // }

  // /**
  //  * @param {object} opts
  //  * @param {WifiAccessPoint[]} opts.wifiAccessPoint
  //  * @returns { Promise<boolean> }
  //  */
  // async configureWifi({ wifiAccessPoint }) {
  //   let message;
  //   if (await this.hasSystemAbility(Namespace.CONFIG_WIFIX)) {
  //     const hardware = await this.querySystemHardware();
  //     message = new ConfigureWifiXMessage({
  //       wifiAccessPoint,
  //       hardware,
  //     });
  //   } else {
  //     message = new ConfigureWifiMessage({ wifiAccessPoint });
  //   }

  //   await this.#transport.send({
  //     message,
  //     signatureKey: this.credentials.key,
  //   });

  //   return true;
  // }
}
