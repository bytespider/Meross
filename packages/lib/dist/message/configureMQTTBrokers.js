"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigureMQTTBrokersMessage = void 0;
const header_1 = require("./header");
const message_1 = require("./message");
class ConfigureMQTTBrokersMessage extends message_1.Message {
    constructor(options) {
        const { payload = {}, header = {}, mqtt, credentials } = options;
        const brokers = mqtt
            .map((broker) => {
            let { host, port } = new URL(broker);
            return {
                host,
                port: Number(port),
            };
        })
            .slice(0, 2); // Limit to 2 brokers
        const primaryBroker = brokers[0];
        const falloverBroker = brokers[1] ?? brokers[0];
        super({
            payload: {
                key: {
                    userId: `${credentials.userId}`,
                    key: `${credentials.key}`,
                    gateway: {
                        host: primaryBroker.host,
                        port: primaryBroker.port,
                        secondHost: falloverBroker.host,
                        secondPort: falloverBroker.port,
                        redirect: 1,
                    },
                },
                ...payload,
            },
            header: {
                method: header_1.Method.SET,
                namespace: header_1.Namespace.CONFIG_KEY,
                ...header,
            },
        });
        this.header.method = header_1.Method.SET;
        this.header.namespace = header_1.Namespace.CONFIG_KEY;
        this.payload.mqtt = mqtt;
    }
}
exports.ConfigureMQTTBrokersMessage = ConfigureMQTTBrokersMessage;
