import { Method, Namespace } from './header';
import { Message, type MessageOptions } from './message';

export class QueryDeviceTimeMessage extends Message {
  constructor(options: MessageOptions = {}) {
    const { payload = {}, header = {} } = options;
    super({
      payload,
      header: {
        method: Method.GET,
        namespace: Namespace.SYSTEM_TIME,
        ...header,
      },
    });
  }
}

export default QueryDeviceTimeMessage;
