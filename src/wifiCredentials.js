import { createCipheriv, createHash } from "crypto";

export class WifiCredentials {
    ssid;
    password;

    constructor(ssid, password) {
        this.ssid = ssid;
        this.password = password;
    }
}

export class SecureWifiCredentials extends WifiCredentials {
    constructor(ssid, password) {
        super(ssid, password);
    }

    encrypt(opts) {
        const {
            type,
            uuid,
            macAddress
        } = opts ?? {};
        const key = createHash('md5').update(`${type}${uuid}${macAddress}`).digest('hex');
        const cipher = createCipheriv('aes-256-cbc', key, '0000000000000000');

        // Ensure the password length is a multiple of 16 by padding with null characters.
        const paddingLength = 16;
        const count = Math.ceil(this.password.length / paddingLength) * paddingLength;
        const paddedPassword = this.password.padEnd(count, '\0');

        this.password = cipher.update(paddedPassword, 'utf8') + cipher.final('utf8');
    }
}