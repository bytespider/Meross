"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryMQTTBrokersAndCredentialsMessage = void 0;
const header_1 = require("./header");
const message_1 = require("./message");
class QueryMQTTBrokersAndCredentialsMessage extends message_1.Message {
    constructor(options = {}) {
        const { header, payload } = options;
        super({
            header: {
                method: header_1.Method.GET,
                namespace: header_1.Namespace.CONFIG_TRACE,
                ...header,
            },
            payload: {
                trace: {},
                ...payload,
            },
        });
    }
}
exports.QueryMQTTBrokersAndCredentialsMessage = QueryMQTTBrokersAndCredentialsMessage;
