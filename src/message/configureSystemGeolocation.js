import { Method, Namespace } from '../header.js';
import { Message } from './message.js';

export class ConfigureSystemGeolocationMessage extends Message {
  /**
   *
   * @param {object} [opts]
   * @param {object} [opts.position ]
   * @param {number} [opts.position.latitude]
   * @param {number} [opts.position.longitude]
   */
  constructor({
    position = {
      latitude: 0,
      longitude: 0,
    },
  }) {
    super();

    this.header.method = Method.SET;
    this.header.namespace = Namespace.SYSTEM_GEOLOCATION;
    this.payload = {
      position: {
        latitude: Number(position.latitude),
        longitude: Number(position.longitude),
      },
    };
  }
}
