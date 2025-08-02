import { Method, Namespace } from './header.js';
import { Message, MessageOptions } from './message.js';

export class QueryWifiListMessage extends Message {
  constructor(options: MessageOptions = {}) {
    const { header, payload } = options;

    super({
      header: {
        method: Method.GET,
        namespace: Namespace.CONFIG_WIFI_LIST,
        ...header,
      },
      payload: {
        trace: {},
        ...payload,
      },
    });
  }
}

export default QueryWifiListMessage;
