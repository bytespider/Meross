import { Method, Namespace } from '../header.js';
import { Message } from './message.js';

export class ConfigureMQTTMessage extends Message {
  /**
   *
   * @param {object} opts
   * @param {string[]} [opts.mqtt]
   * @param {import('../device.js').DeviceCredentials} opts.credentials
   */
  constructor({ mqtt = [], credentials }) {
    super();

    this.header.method = Method.SET;
    this.header.namespace = Namespace.CONFIG_KEY;

    const brokers = mqtt
      .map((address) => {
        let { protocol, hostname: host, port } = new URL(address);
        if (!port) {
          if (protocol === 'mqtt:') {
            port = '1883';
          }
          if (protocol === 'mqtts:') {
            port = '8883';
          }
        }
        return { host, port };
      })
      .slice(0, 2);

    const firstBroker = brokers[0];
    const secondBroker = brokers[1] ?? brokers[0];

    this.payload = {
      key: {
        userId: `${credentials.userId}`,
        key: credentials.key,
        gateway: {
          host: firstBroker.host,
          port: Number(firstBroker.port),
          secondHost: secondBroker.host,
          secondPort: Number(secondBroker.port),
          redirect: 1,
        },
      },
    };
  }
}
