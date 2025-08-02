import { Header } from './header.js';
import { md5 } from '../utils/md5.js';

export type MessageOptions = {
  header?: Header;
  payload?: Record<string, any>;
};

export class Message {
  header;
  payload;

  constructor(options: MessageOptions = {}) {
    this.header = options.header || new Header();
    this.payload = options.payload || {};
  }

  /**
   *
   * @param {string} key
   */
  async sign(key = '') {
    const { messageId, timestamp } = this.header;
    this.header.sign = md5(`${messageId}${key}${timestamp}`, 'hex');
  }
}
