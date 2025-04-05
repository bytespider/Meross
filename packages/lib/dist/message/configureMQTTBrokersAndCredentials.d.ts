import { CloudCredentials } from '../cloudCredentials';
import { Message, MessageOptions } from './message';
export type MQTTBroker = {
    host: string;
    port: number;
};
export declare class ConfigureMQTTBrokersAndCredentialsMessage extends Message {
    constructor(options: MessageOptions & {
        mqtt: MQTTBroker[];
        credentials: CloudCredentials;
    });
}
export default ConfigureMQTTBrokersAndCredentialsMessage;
