import crypto from 'node:crypto';
import { Message } from '../message/message.js';
import { randomId, generateId, generateTimestamp } from '../util.js';
import { ResponseMethod } from '../header.js';

export class Transport {
  #id = `/app/meross-${randomId(8)}/`;
  timeout;

  /**
   * @typedef TransportOptions
   * @property {string} id
   * @property {number} timeout
   */
  /**
   * 
   * @param {TransportOptions} 
   */
  constructor(options = {}) {
    const { id = this.#id, timeout = this.timeout } = options;
    this.#id = id;
    this.timeout = timeout;
  }

  /**
   * @typedef MessageSendOptions
   * @property {Message} message
   * @property {string} signatureKey
   */
  /**
   *
   * @param {MessageSendOptions} message
   * @returns {Promise<any>}
   * @throws Response was not {ResponseMethod}
   */
  async send({ message, signatureKey = '' } = {}) {
    message.header.from = this.#id;
    if (!message.header.messageId) {
      message.header.messageId = generateId();
    }
    if (!message.header.timestamp) {
      message.header.timestamp = generateTimestamp();
    }
    message.sign(signatureKey);

    const response = await this._send(message);
    const { header } = response;

    const expectedResponseMethod = ResponseMethod[message.header.method];
    if (header.method !== expectedResponseMethod) {
      throw new Error(`Response was not ${expectedResponseMethod}`);
    }

    return response;
  }
}