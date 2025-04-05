import { Message, type MessageOptions } from './message.js';
export declare class ConfigureDeviceTimeMessage extends Message {
    constructor(options?: MessageOptions & {
        timestamp: number;
        timezone: string;
    });
}
export default ConfigureDeviceTimeMessage;
