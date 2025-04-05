import { type MacAddress } from '../device';
import { md5 } from './md5';

export function computeDevicePassword(
  macAddress: MacAddress,
  key: string = '',
  userId: number = 0
): string {
  const hash = md5(`${macAddress}${key}`, 'hex');
  return `${userId}_${hash}`;
}

export default computeDevicePassword;
