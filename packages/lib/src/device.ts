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

export class Device {
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
        // If the broker string doesn't include a protocol, assume mqtt://
        if (!broker.includes('://')) {
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
}
