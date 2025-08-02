import { Method, Namespace } from './header.js';
import { Message, MessageOptions } from './message.js';

export class QueryDeviceAbilitiesMessage extends Message {
  constructor(options: MessageOptions = {}) {
    const { payload = {}, header = {} } = options;
    super({
      payload,
      header: {
        method: Method.GET,
        namespace: Namespace.SYSTEM_ABILITY,
        ...header,
      },
    });
  }
}

export default QueryDeviceAbilitiesMessage;
