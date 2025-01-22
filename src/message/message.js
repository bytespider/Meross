import { createHash } from 'node:crypto';
import { Header } from '../header.js';

/**
 * @typedef Message
 * @property {Header} header
 * @property {object} payload
 */
export class Message {
  header;
  payload;

  constructor() {
    this.header = new Header();
    this.payload = {};
  }

  /**
   * 
   * @param {string} key 
   */
  async sign(key = '') {
    const { messageId, timestamp } = this.header;

    this.header.sign = createHash('md5')
      .update(`${messageId}${key}${timestamp}`)
      .digest('hex');
  }
}
