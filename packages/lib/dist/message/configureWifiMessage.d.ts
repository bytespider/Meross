import { WifiAccessPoint } from '../wifi';
import { Message, MessageOptions } from './message';
export declare class ConfigureWifiMessage extends Message {
    constructor(options: MessageOptions & {
        wifiAccessPoint: WifiAccessPoint;
    });
}
export default ConfigureWifiMessage;
