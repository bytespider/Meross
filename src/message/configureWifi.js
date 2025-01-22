import { Method, Namespace } from '../header.js';
import { filterUndefined, base64 } from '../util.js';
import { Message } from './message.js';




export class ConfigureWifiMessage extends Message {
  /**
   *
   * @param {object} opts
   * @param {WifiAccessPoint} param0.wifiAccessPoint
   */
  constructor({ wifiAccessPoint }) {
    super();

    this.header.method = Method.SET;
    this.header.namespace = Namespace.CONFIG_WIFI;

    this.payload = {
      wifi: {
        ...filterUndefined(wifiAccessPoint),
      },
    };

    if (wifiAccessPoint.ssid) {
      this.payload.wifi.ssid = base64.encode(wifiAccessPoint.ssid);
    }

    if (wifiAccessPoint.password) {
      this.payload.wifi.password = base64.encode(wifiAccessPoint.password);
    }
  }
}
