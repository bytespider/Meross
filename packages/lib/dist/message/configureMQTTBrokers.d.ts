import { CloudCredentials } from '../cloudCredentials';
import { Message, MessageOptions } from './message';
export declare class ConfigureMQTTBrokersMessage extends Message {
    constructor(options: MessageOptions & {
        mqtt: string[];
        credentials: CloudCredentials;
    });
}
