import { filterUndefined } from '../utils/filterUndefined.js';
import base64 from '../utils/base64.js';
import { WifiAccessPoint } from '../wifi.js';
import { Method, Namespace } from './header.js';
import { Message, MessageOptions } from './message.js';

export class ConfigureWifiMessage extends Message {
  constructor(
    options: MessageOptions & {
      wifiAccessPoint: WifiAccessPoint;
    }
  ) {
    const { payload = {}, header = {}, wifiAccessPoint } = options;

    const wifi = filterUndefined(wifiAccessPoint);

    if (wifi.ssid) {
      wifi.ssid = base64.encode(wifi.ssid);
    }
    if (wifi.password) {
      wifi.password = base64.encode(wifi.password);
    }

    super({
      payload: {
        wifi,
        ...payload,
      },
      header: {
        method: Method.SET,
        namespace: Namespace.CONFIG_WIFI,
        ...header,
      },
    });
  }
}

export default ConfigureWifiMessage;
