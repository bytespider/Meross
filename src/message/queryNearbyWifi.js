import { Method, Namespace } from '../header.js';
import { Message } from './message.js';

export class QueryNearbyWifiMessage extends Message {
  constructor() {
    super();

    this.header.method = Method.GET;
    this.header.namespace = Namespace.CONFIG_WIFI_LIST;
  }
}
