import { Header } from './header.js';
export type MessageOptions = {
    header?: Header;
    payload?: Record<string, any>;
};
export declare class Message {
    header: any;
    payload: any;
    constructor(options?: MessageOptions);
    /**
     *
     * @param {string} key
     */
    sign(key?: string): Promise<void>;
}
