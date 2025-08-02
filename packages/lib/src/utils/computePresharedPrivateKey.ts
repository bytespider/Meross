import { MacAddress, UUID } from '../device.js';
import base64 from './base64.js';
import md5 from './md5.js';

/**
 * Computes the preshared private key for a device using its UUID, a shared key, and its MAC address.
 * Really shouldn't need this with ECDH key exchange but here we are.
 */
export function computePresharedPrivateKey(
  uuid: UUID,
  key: string,
  macAddress: MacAddress
): string {
  return base64.encode(
    md5(
      `${uuid.slice(3, 22)}${key.slice(1, 9)}${macAddress}${key.slice(10, 28)}`,
      'hex'
    )
  );
}

export default computePresharedPrivateKey;
