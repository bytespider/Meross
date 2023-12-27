export declare function protocolFromPort(port: number): "http" | "https" | "mqtts" | "mqtt";
export declare function portFromProtocol(protocol: string): 80 | 443 | 8883 | 1883;
export declare function isValidPort(port: number): port is 80 | 443 | 8883 | 1883;
declare const _default: {
    protocolFromPort: typeof protocolFromPort;
    portFromProtocol: typeof portFromProtocol;
    isValidPort: typeof isValidPort;
};
export default _default;
