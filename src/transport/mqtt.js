import { Transport } from './transport';


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
