import { Logger } from 'winston';
import got, { HTTPError } from 'got';
import { Message } from "./message.js";
import { Namespace, Method } from "./header.js";
import { URL } from "url";
import { base64, filterUndefined } from './util.js';

/**
 * @typedef {Object}
 * @property {}
 */
const DeviceInformation = {}

/**
 * 
 * @param {Object} opts
 * @param {string} opts.key
 * @param {string} opts.ip
 * @param {Logger} opts.logger
 * @returns {DeviceInformation | undefined} 
 */
export async function queryDeviceInformation(opts) {
  const {
    key = '',
    userId = 0,
    ip = '10.10.10.1',
    logger,
  } = opts ?? {};

  // create message
  const message = new Message();
  message.header.method = Method.GET;
  message.header.namespace = Namespace.SYSTEM_ALL;
  message.sign(key);


  // send message
  try {
    const url = `http:/${ip}/config`
    let response = await got.post(url, {
      timeout: {
        request: 10000
      },
      json: message
    }).json();

    return response.payload.all;
  } catch (error) {
    throw error;
  }
}

export async function queryDeviceWifiList(opts) {
  const {
    key = '',
    userId = 0,
    ip = '10.10.10.1',
    logger,
  } = opts ?? {};

  // create message
  const message = new Message();
  message.header.method = Method.GET;
  message.header.namespace = Namespace.CONFIG_WIFI_LIST;
  message.sign(key);

  // send message
  try {
    const url = `http://${ip}/config`;
    let response = await got.post(url, {
      timeout: {
        request: 10000
      },
      json: message
    }).json();

    return response.payload.wifiList;
  } catch (error) {
    throw error;
  }
}

export async function configureDeviceTime(opts) {
  const {
    key = '',
    userId = 0,
    ip = '10.10.10.1',
    timeZone = 'Etc/UTC',
    timeRules = [],
    logger,
  } = opts ?? {};

  // create message
  const message = new Message();
  message.header.method = Method.SET;
  message.header.namespace = Namespace.SYSTEM_TIME;
  message.sign(key);

  message.payload = {
    time: {
      timestamp: message.header.timestamp,
      timezone: timeZone,
      timeRule: timeRules,
    }
  };

  // send message
  try {
    const url = `http://${ip}/config`;
    let response = await got.post(url, {
      timeout: {
        request: 10000
      },
      json: message,
    }).json();

    console.log(response);

    return true;
  } catch (error) {
    if (!error.response) {
      switch (error.code) {
        case 'ENETUNREACH':
        case 'ECONNABORTED':
          logger?.error('Unable to connect to device');
          break;

        default:
          logger?.error(error.message);
      }
    }

    process.exit(1);
  }
}

export async function configureMqttServers(opts) {
  const {
    key = '',
    userId = 0,
    ip = '10.10.10.1',
    mqtt = [],
    logger,
  } = opts ?? {};

  // create message
  const message = new Message();
  message.header.method = Method.SET;
  message.header.namespace = Namespace.CONFIG_KEY;
  message.sign(key);

  const servers = mqtt?.map(address => {
    let { protocol, hostname: host, port } = new URL(address);
    if (!port) {
      if (protocol === 'mqtt:') {
        port = '1883';
      }
      if (protocol === 'mqtts:') {
        port = '8883';
      }
    }
    return { host, port }
  });

  message.payload = {
    key: {
      userId: `${userId}`,
      key,
      gateway: {
        host: servers[0].host,
        port: servers[0].port,
        secondHost: servers[servers.length > 1 ? 1 : 0].host,
        secondPort: servers[servers.length > 1 ? 1 : 0].port,
        redirect: 1,
      }
    }
  };

  // send message
  try {
    const url = `http://${ip}/config`;
    let response = await got.post(url, {
      timeout: {
        request: 10000
      },
      json: message
    }).json();

    console.log(response);

    return true;
  } catch (error) {
    throw error;
  }
}

export async function configureWifiCredentials(opts) {
  const {
    key = '',
    userId = 0,
    ip = '10.10.10.1',
    credentials = {
      ssid,
      password,
      channel,
      encryption,
      cipher,
      bssid,
    },
    logger,
  } = opts ?? {};

  const ssid = base64.encode(credentials?.ssid);
  const password = base64.encode(credentials?.password);

  // create message
  const message = new Message();
  message.header.method = Method.SET;
  message.header.namespace = Namespace.CONFIG_WIFI;
  message.sign(key);

  message.payload = {
    wifi: {
      ...filterUndefined(credentials),
      ssid,
      password,
    }
  };

  // send message
  try {
    const url = `http://${ip}/config`;
    let response = await got.post(url, {
      timeout: {
        request: 10000
      },
      json: message
    }).json();

    console.log(response);

    return true;
  } catch (error) {
    throw error;
  }
}