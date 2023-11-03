import { createHash } from 'crypto';
import { Header, Method, Namespace } from './header.js';
import { generateTimestamp, filterUndefined, base64 } from './util.js';
import { encryptPassword } from './wifi.js';

/**
 *
 */
export class Message {
  header;
  payload;

  constructor() {
    this.header = new Header();
    this.payload = {};
  }

  async sign(key = '') {
    const { messageId, timestamp } = this.header;

    this.header.sign = createHash('md5')
      .update(`${messageId}${key}${timestamp}`)
      .digest('hex');
  }
}

export class QuerySystemInformationMessage extends Message {
  constructor() {
    super();

    this.header.method = Method.GET;
    this.header.namespace = Namespace.SYSTEM_ALL;
  }
}

export class QuerySystemFirmwareMessage extends Message {
  constructor() {
    super();

    this.header.method = Method.GET;
    this.header.namespace = Namespace.SYSTEM_FIRMWARE;
  }
}

export class QuerySystemHardwareMessage extends Message {
  constructor() {
    super();

    this.header.method = Method.GET;
    this.header.namespace = Namespace.SYSTEM_HARDWARE;
  }
}

export class QuerySystemAbilityMessage extends Message {
  constructor() {
    super();

    this.header.method = Method.GET;
    this.header.namespace = Namespace.SYSTEM_ABILITY;
  }
}

export class QuerySystemTimeMessage extends Message {
  constructor() {
    super();

    this.header.method = Method.GET;
    this.header.namespace = Namespace.SYSTEM_TIME;
  }
}

export class ConfigureSystemTimeMessage extends Message {
  constructor({
    timestamp = generateTimestamp(),
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
    timeRule = [],
  }) {
    super();

    this.header.method = Method.SET;
    this.header.namespace = Namespace.SYSTEM_TIME;
    this.payload = { time: {} };

    if (timestamp > 0) {
      this.payload.time.timestamp = timestamp;
    }
    this.payload.time.timezone = timezone;
    this.payload.time.timeRule = timeRule;
  }
}

export class QuerySystemGeolocationMessage extends Message {
  constructor() {
    super();

    this.header.method = Method.GET;
    this.header.namespace = Namespace.SYSTEM_GEOLOCATION;
  }
}

export class ConfigureSystemGeolocationMessage extends Message {
  constructor({
    position = {
      latitude: 0,
      longitude: 0,
    },
  }) {
    super();

    this.header.method = Method.SET;
    this.header.namespace = Namespace.SYSTEM_GEOLOCATION;
    this.payload = {
      position: {
        latitude: Number(position.latitude),
        longitude: Number(position.longitude),
      },
    };
  }
}

export class QueryNearbyWifiMessage extends Message {
  constructor() {
    super();

    this.header.method = Method.GET;
    this.header.namespace = Namespace.CONFIG_WIFI_LIST;
  }
}

export class ConfigureMQTTMessage extends Message {
  constructor({ mqtt = [], credentials } = {}) {
    super();

    this.header.method = Method.SET;
    this.header.namespace = Namespace.CONFIG_KEY;

    const brokers = mqtt
      .map((address) => {
        let { protocol, hostname: host, port } = new URL(address);
        if (!port) {
          if (protocol === 'mqtt:') {
            port = '1883';
          }
          if (protocol === 'mqtts:') {
            port = '8883';
          }
        }
        return { host, port };
      })
      .slice(0, 2);

    const firstBroker = brokers[0];
    const secondBroker = brokers[1] ?? brokers[0];

    this.payload = {
      key: {
        userId: `${credentials.userId}`,
        key: credentials.key,
        gateway: {
          host: firstBroker.host,
          port: Number(firstBroker.port),
          secondHost: secondBroker.host,
          secondPort: Number(secondBroker.port),
          redirect: 1,
        },
      },
    };
  }
}

export class ConfigureWifiMessage extends Message {
  constructor({ wifiAccessPoint } = {}) {
    super();

    this.header.method = Method.SET;
    this.header.namespace = Namespace.CONFIG_WIFI;
    this.payload = {
      wifi: {
        ...filterUndefined(wifiAccessPoint),
        ssid: base64.encode(wifiAccessPoint.ssid),
        password: base64.encode(wifiAccessPoint.password),
      },
    };
  }
}

export class ConfigureWifiXMessage extends ConfigureWifiMessage {
  constructor({ wifiAccessPoint, hardware } = {}) {
    wifiAccessPoint.password = encryptPassword({
      password: wifiAccessPoint.password,
      hardware,
    });

    super({ wifiAccessPoint });

    this.header.namespace = Namespace.CONFIG_WIFIX;
  }
}
