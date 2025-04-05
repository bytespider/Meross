import { DeviceHardware } from '../device.js';
import { encryptPassword, WifiAccessPoint } from '../wifi.js';
import { ConfigureWifiMessage } from './configureWifiMessage.js';
import { Namespace } from './header.js';
import { MessageOptions } from './message.js';

export class ConfigureWifiXMessage extends ConfigureWifiMessage {
  constructor(
    options: MessageOptions & {
      wifiAccessPoint: WifiAccessPoint;
    }
  ) {
    const { wifiAccessPoint, payload, header } = options;

    super({
      wifiAccessPoint,
      header: {
        namespace: Namespace.CONFIG_WIFIX,
        ...header,
      },
      payload,
    });
  }
}

export default ConfigureWifiXMessage;
