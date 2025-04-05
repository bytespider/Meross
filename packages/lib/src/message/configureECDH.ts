import { Method, Namespace } from './header.js';
import { Message, MessageOptions } from './message.js';

export class ConfigureECDHMessage extends Message {
  constructor(
    options: MessageOptions & {
      publicKey: Buffer;
    }
  ) {
    const { payload = {}, header = {}, publicKey } = options;

    super({
      payload: {
        ecdhe: {
          step: 1,
          pubkey: publicKey.toString('base64'),
        },
        ...payload,
      },
      header: {
        method: Method.SET,
        namespace: Namespace.ENCRYPT_ECDHE,
        ...header,
      },
    });
  }
}

export default ConfigureECDHMessage;
