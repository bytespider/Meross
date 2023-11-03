import { Method, Namespace } from './header.js';
import {
  ConfigureMQTTMessage,
  QuerySystemFirmwareMessage,
  QuerySystemHardwareMessage,
  QueryNearbyWifiMessage,
  QuerySystemAbilityMessage,
  QuerySystemInformationMessage,
  QuerySystemTimeMessage,
  SetSystemTimeMessage,
  ConfigureWifiXMessage,
  ConfigureWifiMessage,
  Message,
} from './message.js';
import { Transport } from './transport.js';
import { WifiAccessPoint, encryptPassword } from './wifi.js';

const CredentialDefaults = {
  userId: 0,
  key: '',
};

const FirmwareDefaults = {
  version: '0.0.0',
  compileTime: new Date().toString(),
};

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

  async queryCustom(namespace) {
    const message = new Message();
    message.header.method = Method.GET;
    message.header.namespace = namespace;

    return this.#transport.send({
      message,
      signatureKey: this.credentials.key,
    });
  }

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

  async querySystemAbility(updateDevice = true) {
    const message = new QuerySystemAbilityMessage();

    const { payload } = await this.#transport.send({
      message,
      signatureKey: this.credentials.key,
    });

    const { ability } = payload;
    if (updateDevice) {
    }

    return ability;
  }

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

  async setSystemTime({ timestamp, timezone } = {}, updateDevice = true) {
    const message = new SetSystemTimeMessage({ timestamp, timezone });

    await this.#transport.send({ message, signatureKey: this.credentials.key });

    return true;
  }

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
   * @typedef ConfigureMQTTBrokersParameters
   * @property {string[]} mqtt
   *
   * @param {ConfigureMQTTBrokersParameters}
   * @returns {Bsoolean}
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
   * @typedef ConfigureWifiParameters
   * @property {WifiAccessPoint} wifiAccessPoint
   *
   * @param {ConfigureWifiParameters}
   * @returns {Boolean}
   */
  async configureWifi({ wifiAccessPoint }) {
    const abilities = await this.querySystemAbility();

    let message;
    if (Namespace.CONFIG_WIFIX in abilities) {
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
