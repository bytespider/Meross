import { MacAddress, UUID } from '../device.js';
/**
 * Computes the preshared private key for a device using its UUID, a shared key, and its MAC address.
 * Really shouldn't need this with ECDH key exchange but here we are.
 */
export declare function computePresharedPrivateKey(uuid: UUID, key: string, macAddress: MacAddress): string;
export default computePresharedPrivateKey;
