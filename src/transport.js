import got from 'got';
import { randomUUID } from 'node:crypto';
import { Message } from './message.js';
import { isIPv4 } from 'node:net';
import { generateId, generateTimestamp } from './util.js';
import { ResponseMethod } from './header.js';

export class Transport {
  #id = `/app/meross-${randomUUID()}/`;
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
  constructor({ id = `/app/meross-${randomUUID()}/`, timeout = 10000 } = {}) {
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

    message.header.from = this.id;
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

export class MockTransport extends Transport {
  /**
   * @typedef MockTransportOptions
   * @extends TransportOptions
   */
  /**
   * @param {MockTransportOptions}
   */
  constructor() {
    super();
  }
}

export class HTTPTransport extends Transport {
  #ip;

  /**
   * @typedef HTTPTransportOptions 
   * @property {string} ip
   */

  /**
   * 
   * @param {TransportOptions & HTTPTransportOptions} 
   * @throws HTTPTransport: IP needs to be an IPv4 address
   */
  constructor({ ip = '10.10.10.1' }) {
    if (!isIPv4(ip)) {
      throw new Error('HTTPTransport: IP needs to be an IPv4 address');
    }

    super();

    this.#ip = ip;
  }

  get endpoint() {
    return `http://${this.#ip}/config`;
  }

  /**
   * @private
   * @param {Message} message
   * @throws Host refused connection. Is the device IP '{IP Address}' correct?
   * @throws Timeout awaiting {Message Namespace} for 10000s
   */
  async _send(message) {
    try {
      return got
        .post(this.endpoint, {
          timeout: {
            request: this.timeout,
          },
          json: message,
        })
        .json();
    } catch (error) {
      switch (error.code) {
        case 'ECONNREFUSED':
          throw new Error(
            `Host refused connection. Is the device IP '${this.#ip}' correct?`
          );

        case 'ETIMEDOUT':
          let hint = '';
          if (this.host === '10.10.10.1') {
            hint =
              "\nAre you connected to the device's Access Point which starts with 'Meross_'?";
          }
          throw new Error(
            `Timeout awaiting ${message.header.namespace} for 10000s.${hint}`
          );
      }
    }
  }
}

export class MQTTTransport extends Transport {
  constructor() {
    super();
  }

  /**
   * @private
   * @param {Message} message
   */
  async _send(message) {
    return {};
  }
}
