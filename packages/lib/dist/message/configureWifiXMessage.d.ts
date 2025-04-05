import { WifiAccessPoint } from '../wifi.js';
import { ConfigureWifiMessage } from './configureWifiMessage.js';
import { MessageOptions } from './message.js';
export declare class ConfigureWifiXMessage extends ConfigureWifiMessage {
    constructor(options: MessageOptions & {
        wifiAccessPoint: WifiAccessPoint;
    });
}
export default ConfigureWifiXMessage;
