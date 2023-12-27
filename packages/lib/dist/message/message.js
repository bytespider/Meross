"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const header_js_1 = require("./header.js");
const md5_js_1 = require("../utils/md5.js");
class Message {
    header;
    payload;
    constructor(options = {}) {
        this.header = options.header || new header_js_1.Header();
        this.payload = options.payload || {};
    }
    /**
     *
     * @param {string} key
     */
    async sign(key = '') {
        const { messageId, timestamp } = this.header;
        this.header.sign = (0, md5_js_1.md5)(`${messageId}${key}${timestamp}`, 'hex');
    }
}
exports.Message = Message;
