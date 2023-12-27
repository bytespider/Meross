import { Method, Namespace } from './header.js';
import {
  ConfigureMQTTMessage,
  QuerySystemFirmwareMessage,
  QuerySystemHardwareMessage,
  QueryNearbyWifiMessage,
  QuerySystemAbilityMessage,
  QuerySystemInformationMessage,
  QuerySystemTimeMessage,
  ConfigureSystemTimeMessage,
  ConfigureWifiXMessage,
  ConfigureWifiMessage,
  Message,
} from './message.js';
import { Transport } from './transport.js';
import { WifiAccessPoint } from './wifi.js';

/**
 * @typedef DeviceCredentials
 * @property {number} userId
 * @property {string} key
 */

/** @type {DeviceCredentials} */
const CredentialDefaults = {
  userId: 0,
  key: '',
};

/**
 * @typedef DeviceFirmware
 * @property {string} version
 * @property {number} compileTime
 */

/** @type {DeviceFirmware} */
const FirmwareDefaults = {
  version: '0.0.0',
  compileTime: new Date().toString(),
};

/**
 * @typedef DeviceHardware
 * @property {string} version
 * @property {string} macAddress
 */

/** @type {DeviceHardware} */
const HardwareDefaults = {
  version: '0.0.0',
  macAddress: '00:00:00:00:00:00',
};

export class Device {
  /**
   * @property {Transport} transport
   */
  #transport;

  model;
  hardware;
  firmware;
  credentials;

  ability = {};

  /**
   * @typedef DeviceOptions
   * @property {Transport} transport
   * @property {string} model
   * @property {DeviceFirmware} firmware
   * @property {DeviceHardware} hardware
   * @property {DeviceCredentials} credentials
   */
  /**
   * 
   * @param {DeviceOptions}
   */
  constructor({
    transport,
    model = '',
    firmware = FirmwareDefaults,
    hardware = HardwareDefaults,
    credentials = CredentialDefaults,
  } = {}) {
    if (model) {
      this.model = model;
    }
    if (firmware) {
      this.firmware = firmware;
    }
    if (hardware) {
      this.hardware = hardware;
    }
    if (transport) {
      this.transport = transport;
    }
    if (credentials) {
      this.credentials = credentials;
    }
  }

  /**
   * @param {Transport} transport
   */
  set transport(transport) {
    this.#transport = transport;
  }

  /**
   * 
   * @param {Namespace} namespace 
   * @param {object} [payload] 
   * @returns {Promise<any>}
   */
  async queryCustom(namespace, payload = {}) {
    const message = new Message();
    message.header.method = Method.GET;
    message.header.namespace = namespace;
    message.payload = payload;

    return this.#transport.send({
      message,
      signatureKey: this.credentials.key,
    });
  }

  /**
   * 
   * @param {Namespace} namespace 
   * @param {object} [payload] 
   * @returns  {Promise<any>}
   */
  async configureCustom(namespace, payload = {}) {
    const message = new Message();
    message.header.method = Method.SET;
    message.header.namespace = namespace;
    message.payload = payload;

    return this.#transport.send({
      message,
      signatureKey: this.credentials.key,
    });
  }

  /**
   * @typedef QuerySystemInformationResponse
   * @property {object} system
   * @property {QuerySystemFirmwareResponse} system.firmware
   * @property {QuerySystemHardwareResponse} system.hardware
   */
  /**
   * 
   * @param {boolean} [updateDevice] 
   * @returns {Promise<QuerySystemInformationResponse>}
   */
  async querySystemInformation(updateDevice = true) {
    const message = new QuerySystemInformationMessage();
    message.sign(this.credentials.key);

    const { payload } = await this.#transport.send({
      message,
      signatureKey: this.credentials.key,
    });

    const { all } = payload;

    if (updateDevice) {
      const {
        system: { firmware = FirmwareDefaults, hardware = HardwareDefaults },
      } = all;

      this.model = hardware?.type;
      this.firmware = {
        version: firmware?.version,
        compileTime: firmware?.compileTime
          ? new Date(firmware?.compileTime)
          : undefined,
      };
      this.hardware = {
        version: hardware?.version,
        macAddress: hardware?.macAddress,
      };
    }

    return all;
  }

  /**
   * @typedef QuerySystemFirmwareResponse
   * @property {string} version
   * @property {number} compileTime
   */
  /**
   * 
   * @param {boolean} [updateDevice] 
   * @returns {Promise<QuerySystemFirmwareResponse>}
   */
  async querySystemFirmware(updateDevice = true) {
    const message = new QuerySystemFirmwareMessage();

    const { payload } = await this.#transport.send({
      message,
      signatureKey: this.credentials.key,
    });

    const { firmware = FirmwareDefaults } = payload;

    if (updateDevice) {
      this.firmware = {
        version: firmware?.version,
        compileTime: firmware?.compileTime
          ? new Date(firmware?.compileTime)
          : undefined,
      };
    }

    return firmware;
  }

  /**
   * @typedef QuerySystemHardwareResponse
   * @property {string} version
   * @property {string} macAddress
   */
  /**
   * 
   * @param {boolean} [updateDevice] 
   * @returns {Promise<QuerySystemHardwareResponse>}
   */
  async querySystemHardware(updateDevice = true) {
    const message = new QuerySystemHardwareMessage();

    const { payload } = await this.#transport.send({
      message,
      signatureKey: this.credentials.key,
    });

    const { hardware = HardwareDefaults } = payload;

    if (updateDevice) {
      this.hardware = {
        version: hardware?.version,
        macAddress: hardware?.macAddress,
      };
    }

    return hardware;
  }

  /**
   * 
   * @param {Namespace} ability 
   * @param {boolean} [updateDevice] 
   * @returns {Promise<boolean>}
   */
  async hasSystemAbility(ability, updateDevice = true) {
    if (Object.keys(this.ability).length == 0 && updateDevice) {
      this.querySystemAbility(updateDevice);
    }

    return ability in this.ability;
  }

  /**
   * @typedef QuerySystemAbilityResponse
   */
  /**
   * 
   * @param {boolean} [updateDevice] 
   * @returns {Promise<QuerySystemAbilityResponse>}
   */
  async querySystemAbility(updateDevice = true) {
    const message = new QuerySystemAbilityMessage();

    const { payload } = await this.#transport.send({
      message,
      signatureKey: this.credentials.key,
    });

    const { ability } = payload;
    if (updateDevice) {
      this.ability = ability;
    }

    return ability;
  }

  /**
   * @typedef QuerySystemTimeResponse
   * @property {number} timestamp
   * @property {string} timezone
   */
  /**
   * 
   * @param {boolean} [updateDevice] 
   * @returns {Promise<QuerySystemTimeResponse>}
   */
  async querySystemTime(updateDevice = true) {
    const message = new QuerySystemTimeMessage();

    const { payload } = await this.#transport.send({
      message,
      signatureKey: this.credentials.key,
    });

    const { time } = payload;
    if (updateDevice) {
    }

    return time;
  }

  /**
   * 
   * @param {object} [opts]
   * @param {number} [opts.timestamp]
   * @param {string} [opts.timezone]
   * @param {boolean} [updateDevice] 
   * @returns {Promise<boolean>}
  */
  async configureSystemTime({ timestamp, timezone } = {}, updateDevice = true) {
    const message = new ConfigureSystemTimeMessage({ timestamp, timezone });

    await this.#transport.send({ message, signatureKey: this.credentials.key });

    return true;
  }

  /**
   * @typedef QuerySystemGeolocationResponse
   */
  /**
   * 
   * @param {boolean} [updateDevice] 
   * @returns {Promise<QuerySystemGeolocationResponse>}
   */
  async querySystemGeolocation(updateDevice = true) {
    const message = new QuerySystemTimeMessage();

    const { payload } = await this.#transport.send({
      message,
      signatureKey: this.credentials.key,
    });

    const { position } = payload;
    if (updateDevice) {
    }

    return position;
  }

  /**
   * @param {object} [opts]
   * @param {} [opts.position]
   * @param {boolean} [updateDevice] 
   * @returns {Promise<boolean>}
   */
  async configureSystemGeolocation({ position } = {}, updateDevice = true) {
    const message = new ConfigureSystemPositionMessage({ position });

    await this.#transport.send({ message, signatureKey: this.credentials.key });

    return true;
  }

  /**
   * 
   * @returns {Promise<WifiAccessPoint[]>}
   */
  async queryNearbyWifi() {
    const message = new QueryNearbyWifiMessage();

    const { payload } = await this.#transport.send({
      message,
      signatureKey: this.credentials.key,
    });

    const { wifiList } = payload;

    return wifiList.map((item) => new WifiAccessPoint(item));
  }

  /**
   * @param { object } [opts]
   * @param { string[] } [opts.mqtt]
   * @returns { Promise<boolean> }
   */
  async configureMQTTBrokers({ mqtt = [] } = {}) {
    const message = new ConfigureMQTTMessage({
      mqtt,
      credentials: this.credentials,
    });

    await this.#transport.send({
      message,
      signatureKey: this.credentials.key,
    });

    return true;
  }

  /**
   * @param {object} opts
   * @param {WifiAccessPoint[]} opts.wifiAccessPoint
   * @returns { Promise<boolean> }
   */
  async configureWifi({ wifiAccessPoint }) {
    let message;
    if (await this.hasSystemAbility(Namespace.CONFIG_WIFIX)) {
      const hardware = await this.querySystemHardware();
      message = new ConfigureWifiXMessage({
        wifiAccessPoint,
        hardware,
      });
    } else {
      message = new ConfigureWifiMessage({ wifiAccessPoint });
    }

    await this.#transport.send({
      message,
      signatureKey: this.credentials.key,
    });

    return true;
  }
}
