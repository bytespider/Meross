import { Method, Namespace } from '../header.js';
import { Message } from './message.js';

export class QuerySystemInformationMessage extends Message {
  constructor() {
    super();

    this.header.method = Method.GET;
    this.header.namespace = Namespace.SYSTEM_ALL;
  }
}