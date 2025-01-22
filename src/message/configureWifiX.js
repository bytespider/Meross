import { Namespace } from '../header.js';
import { encryptPassword } from '../wifi.js';
import { ConfigureWifiMessage } from './configureWifi.js';

export class ConfigureWifiXMessage extends ConfigureWifiMessage {
  /**
   *
   * @param {object} opts
   * @param {WifiAccessPoint} opts.wifiAccessPoint
   * @param {import('../device.js').DeviceHardware} opts.hardware
   */
  constructor({ wifiAccessPoint, hardware }) {
    wifiAccessPoint.password = encryptPassword({
      password: wifiAccessPoint.password,
      hardware,
    });

    super({ wifiAccessPoint });

    this.header.namespace = Namespace.CONFIG_WIFIX;
  }
}
