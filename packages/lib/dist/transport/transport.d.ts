import { Message } from '../message/message.js';
import { CloudCredentials } from '../cloudCredentials.js';
export declare const DEFAULT_TIMEOUT = 10000;
export type TransportOptions = {
    timeout?: number;
    credentials?: CloudCredentials;
};
export type MessageSendOptions = {
    message: Message;
    encryptionKey?: Buffer;
};
export declare class TransportSendOptions {
    message: Record<string, any>;
    encryptionKey?: Buffer;
}
export declare abstract class Transport {
    id: string;
    timeout: any;
    credentials: CloudCredentials | undefined;
    constructor(options?: TransportOptions);
    send(options: MessageSendOptions): Promise<any>;
    protected abstract _send(options: TransportSendOptions): Promise<any>;
}
