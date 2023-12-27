import { Message, MessageOptions } from './message.js';
export declare class ConfigureECDHMessage extends Message {
    constructor(options: MessageOptions & {
        publicKey: Buffer;
    });
}
export default ConfigureECDHMessage;
