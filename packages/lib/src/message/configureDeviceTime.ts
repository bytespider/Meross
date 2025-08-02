import { generateTimestamp } from '../utils/generateTimestamp.js';
import { Method, Namespace } from './header.js';
import { Message, type MessageOptions } from './message.js';

export class ConfigureDeviceTimeMessage extends Message {
  constructor(
    options: MessageOptions & { timestamp: number; timezone: string } = {
      timestamp: generateTimestamp(),
      timezone: 'Etc/UTC',
    }
  ) {
    const { header, payload, timestamp, timezone } = options;

    super({
      header: {
        method: Method.SET,
        namespace: Namespace.SYSTEM_TIME,
        ...header,
      },
      payload: {
        time: {
          timezone,
          timestamp,
        },
        ...payload,
      },
    });
  }
}

export default ConfigureDeviceTimeMessage;
