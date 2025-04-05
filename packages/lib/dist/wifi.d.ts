import type { DeviceHardware } from './device.js';
export declare enum WifiCipher {
    NONE = 0,
    WEP = 1,
    TKIP = 2,
    AES = 3,
    TIKPAES = 4
}
export declare enum WifiEncryption {
    OPEN = 0,
    SHARE = 1,
    WEPAUTO = 2,
    WPA1 = 3,
    WPA1PSK = 4,
    WPA2 = 5,
    WPA2PSK = 6,
    WPA1WPA2 = 7,
    WPA1PSKWPA2PS = 8
}
type EncryptPasswordOptions = {
    password: string;
    hardware: DeviceHardware & {
        type: string;
    };
};
export declare function encryptPassword(options: EncryptPasswordOptions): Promise<Buffer>;
export type WifiAccessPointOptions = {
    ssid?: string;
    bssid?: string;
    channel?: number;
    cipher?: WifiCipher;
    encryption?: WifiEncryption;
    password?: string;
    signal?: number;
};
export declare class WifiAccessPoint {
    ssid: any;
    bssid: any;
    channel: any;
    cipher: any;
    encryption: any;
    password: any;
    signal: any;
    constructor(options?: WifiAccessPointOptions);
    isOpen(): boolean;
    isWEP(): boolean;
}
export {};
