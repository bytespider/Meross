import { CloudCredentials } from '../cloudCredentials';
import { Method, Namespace } from './header';
import { Message, MessageOptions } from './message';

export type MQTTBroker = {
  host: string;
  port: number;
};

export class ConfigureMQTTBrokersAndCredentialsMessage extends Message {
  constructor(
    options: MessageOptions & {
      mqtt: MQTTBroker[];
      credentials: CloudCredentials;
    }
  ) {
    const { payload = {}, header = {}, mqtt, credentials } = options;

    const primaryBroker = mqtt[0];
    const falloverBroker = mqtt[1] ?? mqtt[0];

    super({
      payload: {
        key: {
          userId: `${credentials.userId}`,
          key: `${credentials.key}`,
          gateway: {
            host: primaryBroker.host,
            port: primaryBroker.port,
            secondHost: falloverBroker.host,
            secondPort: falloverBroker.port,
            redirect: 1,
          },
        },
        ...payload,
      },
      header: {
        method: Method.SET,
        namespace: Namespace.CONFIG_KEY,
        payloadVersion: 1,
        ...header,
      },
    });
  }
}

export default ConfigureMQTTBrokersAndCredentialsMessage;
