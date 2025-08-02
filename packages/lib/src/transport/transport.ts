import { Message } from '../message/message.js';
import { ResponseMethodLookup } from '../message/header.js';
import { generateTimestamp, randomId } from '../utils/index.js';
import { CloudCredentials } from '../cloudCredentials.js';
import logger from '../utils/logger.js';

const transportLogger = logger.child({
  name: 'transport',
});

export const DEFAULT_TIMEOUT = 10_000;

export type TransportOptions = {
  timeout?: number;
  credentials?: CloudCredentials;
};

export type MessageSendOptions = {
  message: Message;
  encryptionKey?: Buffer;
};

export class TransportSendOptions {
  message: Record<string, any> = {};
  encryptionKey?: Buffer;
}

export abstract class Transport {
  id: string = `transport/${randomId()}`;
  timeout;

  credentials: CloudCredentials | undefined;

  constructor(options: TransportOptions = {}) {
    this.timeout = options.timeout || DEFAULT_TIMEOUT;
    this.credentials = options.credentials;

    transportLogger.debug(
      `Transport initialized. Credentials: ${JSON.stringify(this.credentials)}`
    );
  }

  async send(options: MessageSendOptions) {
    const { message, encryptionKey } = options;

    if (!message) {
      throw new Error('Message is required');
    }

    message.header.from = this.id;

    if (!message.header.messageId) {
      message.header.messageId = randomId();
    }

    if (!message.header.timestamp) {
      message.header.timestamp = generateTimestamp();
    }

    logger.debug(`Signing message ${message.header.messageId}`);

    message.sign(this.credentials?.key);

    const response = await this._send({
      message,
      encryptionKey,
    });
    const { header } = response;

    const expectedResponseMethod = ResponseMethodLookup[message.header.method];
    if (header.method !== expectedResponseMethod) {
      throw new Error(`Response was not ${expectedResponseMethod}`);
    }

    return response;
  }

  protected abstract _send(options: TransportSendOptions): Promise<any>;
}
