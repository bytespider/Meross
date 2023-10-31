import { createHash } from 'crypto';
import { Header } from './header.js';

/**
 * 
 */
export class Message {
  header;
  payload;

  constructor() {
    this.header = new Header();
    this.payload = {};
  }

  async sign(key = '') {
    const {
      messageId,
      timestamp
    } = this.header;

    this.header.sign = createHash('md5').update(`${messageId}${key}${timestamp}`).digest('hex');
  }
}
