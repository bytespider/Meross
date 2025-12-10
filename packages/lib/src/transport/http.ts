import fetch from 'node-fetch';
import { Request } from 'node-fetch';
import Encryption from '../encryption.js';
import {
  type TransportOptions,
  Transport,
  TransportSendOptions,
} from './transport.js';
import base64 from '../utils/base64.js';
import logger from '../utils/logger.js';

export type HTTPTransportOptions = TransportOptions & {
  url: string;
  fetch?: typeof fetch;
};

const httpLogger = logger.child({
  name: 'http',
});

export class HTTPTransport extends Transport {
  private url: string;
  private fetch: typeof fetch;

  constructor(options: HTTPTransportOptions) {
    super(options);
    this.url = options.url;
    this.id = `${this.url}`;
    this.fetch = options.fetch ?? fetch;

    httpLogger.debug(`HTTPTransport initialized with URL: ${this.url}`);
  }

  protected async _send(
    options: TransportSendOptions,
  ): Promise<Record<string, any>> {
    const { message, encryptionKey } = options;

    const requestLogger = logger.child({
      name: 'request',
      requestId: message.header?.messageId,
    });

    let body = JSON.stringify(message);

    let requestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json',
      },
      body,
    };

    // Encrypt the message if encryptionKey is provided
    if (encryptionKey) {
      const data = Buffer.from(body, 'utf-8');

      const encryptedData = await Encryption.encrypt(data, encryptionKey);
      body = await base64.encode(encryptedData);

      requestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          Accept: 'text/plain',
        },
        body,
      };
    }

    requestLogger.http(
      `${requestInit.method} ${this.url} ${JSON.stringify(
        requestInit.headers,
      )} ${requestInit.body}`,
      {
        request: requestInit,
      },
    );

    const response = await this.fetch(this.url, requestInit);

    requestLogger.http(
      `${response.status} ${response.statusText} ${JSON.stringify(
        response.headers,
      )} ${await response.clone().text()}`,
      {
        response,
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let responseBody: string | undefined;

    // Decrypt the response if encryptionKey is provided
    if (encryptionKey) {
      responseBody = await response.text();
      const data = base64.decode(responseBody);
      const decryptedData = await Encryption.decrypt(data, encryptionKey);
      responseBody = decryptedData.toString('utf-8');
    } else {
      responseBody = await response.text();
    }

    if (!responseBody) {
      throw new Error('Empty response body');
    }

    const responseMessage = JSON.parse(responseBody);
    if (responseMessage.error) {
      throw new Error(`Error from server: ${responseMessage.error}`);
    }
    return responseMessage;
  }
}
