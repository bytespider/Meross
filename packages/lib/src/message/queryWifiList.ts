import { Method, Namespace } from './header';
import { Message, MessageOptions } from './message';

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
