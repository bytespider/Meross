import { CloudCredentials } from './cloudCredentials.js';
import { type EncryptionKeyPair } from './encryption.js';
import { WifiAccessPoint } from './wifi.js';
import { Namespace } from './message/header.js';
import { Transport } from './transport/transport.js';
export type MacAddress = `${string}:${string}:${string}:${string}:${string}:${string}`;
export type UUID = string;
export type DeviceFirmware = {
    version: string;
    compileTime: Date;
};
export type DeviceHardware = {
    version?: string;
    uuid: UUID;
    macAddress: MacAddress;
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
export declare class Device implements Device {
    firmware: DeviceFirmware;
    hardware: DeviceHardware;
    model?: string;
    ability: Record<string, any>;
    encryptionKeys: EncryptionKeys;
    protected transport: Transport;
    constructor(options?: DeviceOptions);
    get id(): UUID;
    setTransport(transport: Transport): void;
    setPrivateKey(privateKey: Buffer): Promise<void>;
    hasAbility(ability: Namespace): boolean;
    private sendMessage;
    fetchDeviceInfo(): Promise<any>;
    fetchDeviceAbilities(): Promise<any>;
    fetchDeviceTime(): Promise<any>;
    exchangeKeys(): Promise<void>;
    configureDeviceTime(timestamp: number, timezone?: string | undefined): Promise<void>;
    configureMQTTBrokersAndCredentials(mqtt: string[], credentials: CloudCredentials): Promise<void>;
    fetchNearbyWifi(): Promise<WifiAccessPoint[]>;
    configureWifi(wifiAccessPoint: WifiAccessPoint): Promise<boolean>;
}
