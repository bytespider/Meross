import type { UUID, Device } from './device.js';
import { type Transport } from './transport/transport.js';
import { Namespace } from './message/header.js';
import { Message } from './message/message.js';

export type DeviceManagerOptions = {
  transport: Transport;
};

export class DeviceManager {
  private transport: Transport;
  private devices: Map<UUID, Device> = new Map();

  constructor(options: DeviceManagerOptions) {
    this.transport = options.transport;
  }

  addDevice(device: Device): void {
    this.devices.set(device.id as UUID, device);
  }

  removeDevice(device: Device): void {
    this.devices.delete(device.id as UUID);
  }

  removeDeviceById(deviceId: string): void {
    this.devices.delete(deviceId as UUID);
  }

  getDevices(): Map<UUID, Device> {
    return this.devices;
  }

  getDeviceById(deviceId: string): Device | undefined {
    return this.devices.get(deviceId as UUID);
  }

  async sendMessageToDevice(
    deviceOrId: UUID | Device,
    message: Message
  ): Promise<Record<string, any>> {
    let device = deviceOrId as Device;
    if (typeof deviceOrId === 'string') {
      device = this.getDeviceById(deviceOrId) as Device;
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

  private shouldEncryptMessage(device: Device, message: any): boolean {
    const hasAbility = device.hasAbility(Namespace.ENCRYPT_ECDHE);
    const excludedNamespaces = [
      Namespace.SYSTEM_ALL,
      Namespace.SYSTEM_FIRMWARE,
      Namespace.SYSTEM_ABILITY,
      Namespace.ENCRYPT_ECDHE,
      Namespace.ENCRYPT_SUITE,
    ];
    return hasAbility && !excludedNamespaces.includes(message.namespace);
  }
}
