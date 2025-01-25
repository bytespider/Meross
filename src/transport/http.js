import ky from 'ky';
import net from 'net';
import { Transport } from './transport.js';
import { logger as masterLogger, randomId } from '../util.js';

const logger = masterLogger.child({ module: 'Meross:HTTPTransport' });

export class HTTPTransport extends Transport {
  #ip;
  #http;

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
    if (!net.isIPv4(ip)) {
      const error = new Error('HTTPTransport: IP needs to be an IPv4 address');
      logger.error(error);
      throw error;
    }

    super();

    this.#ip = ip;

    this.#http = ky.extend({
      hooks: {
        beforeRequest: [
          async (request) => {
            const requestId = randomId(8);

            const body = await request.clone().json();
            logger.child({ requestId }).http(`${request.method} ${request.url}`, {
              headers: Object.fromEntries(request.headers.entries()),
              body,
            });

            request.headers.set('X-Request-Id', requestId);
          },
        ],
        afterResponse: [
          async (request, options, response) => {
            const requestId = request.headers.get('X-Request-Id');

            logger.child({ requestId }).http(`${response.status} ${response.statusText}`, {
              headers: Object.fromEntries(response.headers.entries()),
              body: await response.clone().json(),
            });

            return response;
          },
        ]
      }
    });
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
      return this.#http.post(this.endpoint, {
        timeout: this.timeout,
        json: message,
      }).json().catch((error) => {
        console.log(error);
        if (error.response) {
          throw new Error(
            `Error ${error.response.statusCode}: ${error.response.body.message}`
          );
        }

        throw error;
      });
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

        case 'ECONNRESET':
          throw new Error(
            `Connection reset by peer.`
          );

        case 'ENOTFOUND':
          throw new Error(
            `Device IP '${this.#ip}' not found. Is the device powered on?`
          );
      }
    }
  }
}