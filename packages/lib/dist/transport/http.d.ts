import { type TransportOptions, Transport, TransportSendOptions } from './transport.js';
export type HTTPTransportOptions = TransportOptions & {
    url: string;
};
export declare class HTTPTransport extends Transport {
    private url;
    constructor(options: HTTPTransportOptions);
    protected _send(options: TransportSendOptions): Promise<Record<string, any>>;
}
