import { Header } from "./header.js";
import { MessageOptions } from "./message.js";

export class MessageResponse {
  header: Header;
  payload: Record<string, any>;
  error?: string;

  constructor(options: MessageOptions = {}) {
    this.header = options.header || new Header();
    this.payload = options.payload || {};
  }
}