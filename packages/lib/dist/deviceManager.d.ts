import type { UUID, Device } from './device.js';
import { type Transport } from './transport/transport.js';
import { Message } from './message/message.js';
export type DeviceManagerOptions = {
    transport: Transport;
};
export declare class DeviceManager {
    private transport;
    private devices;
    constructor(options: DeviceManagerOptions);
    addDevice(device: Device): void;
    removeDevice(device: Device): void;
    removeDeviceById(deviceId: string): void;
    getDevices(): Map<UUID, Device>;
    getDeviceById(deviceId: string): Device | undefined;
    sendMessageToDevice(deviceOrId: UUID | Device, message: Message): Promise<Record<string, any>>;
    private shouldEncryptMessage;
}
