import { Method, Namespace } from '../header.js';
import { Message } from './message.js';

export class ConfigureSystemTimeMessage extends Message {
  /**
   * 
   * @param {object} [opts]
   * @param {number} [opts.timestamp]
   * @param {string} [opts.timezone]
   * @param {any[]} [opts.timeRule]
   */
  constructor({
    timestamp = generateTimestamp(),
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
    timeRule = [],
  }) {
    super();

    this.header.method = Method.SET;
    this.header.namespace = Namespace.SYSTEM_TIME;
    this.payload = { time: {} };

    if (timestamp > 0) {
      this.payload.time.timestamp = timestamp;
    }
    this.payload.time.timezone = timezone;
    this.payload.time.timeRule = timeRule;
  }
}