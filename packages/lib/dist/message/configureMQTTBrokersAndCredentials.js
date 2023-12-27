"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigureMQTTBrokersAndCredentialsMessage = void 0;
const header_1 = require("./header");
const message_1 = require("./message");
class ConfigureMQTTBrokersAndCredentialsMessage extends message_1.Message {
    constructor(options) {
        const { payload = {}, header = {}, mqtt, credentials } = options;
        const primaryBroker = mqtt[0];
        const falloverBroker = mqtt[1] ?? mqtt[0];
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
                payloadVersion: 1,
                ...header,
            },
        });
    }
}
exports.ConfigureMQTTBrokersAndCredentialsMessage = ConfigureMQTTBrokersAndCredentialsMessage;
exports.default = ConfigureMQTTBrokersAndCredentialsMessage;
