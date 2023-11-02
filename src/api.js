import { Logger } from 'winston';
import { Message } from './message.js';
import { Namespace, Method, ResponseMethod } from './header.js';
import { URL } from 'url';
import { base64, filterUndefined } from './util.js';

/**
 * @typedef {Object}
 * @property {}
 */
const DeviceInformation = {};

/**
 *
 * @param {Object} opts
 * @param {string} opts.key
 * @param {string} opts.ip
 * @param {Logger} opts.logger
 * @returns {DeviceInformation | undefined}
 */
export async function queryDeviceInformation(opts) {
  const { http, key = '', userId = 0, logger } = opts ?? {};

  // create message
  const message = new Message();
  message.header.method = Method.GET;
  message.header.namespace = Namespace.SYSTEM_ALL;
  message.sign(key);

  // send message
  const {
    payload: { all: deviceInformation },
  } = await http.send(message);
  return deviceInformation;
}

export async function queryDeviceWifiList(opts) {
  const { http, key = '', userId = 0, logger } = opts ?? {};

  // create message
  const message = new Message();
  message.header.method = Method.GET;
  message.header.namespace = Namespace.CONFIG_WIFI_LIST;
  message.sign(key);

  // send message
  const {
    payload: { wifiList },
  } = await http.send(message);
  return wifiList;
}

export async function queryDeviceAbility(opts) {
  const { http, key = '', userId = 0, logger } = opts ?? {};

  // create message
  const message = new Message();
  message.header.method = Method.GET;
  message.header.namespace = Namespace.SYSTEM_ABILITY;
  message.sign(key);

  // send message
  const {
    payload: { ability },
  } = await http.send(message);
  return ability;
}

export async function configureDeviceTime(opts) {
  const {
    http,
    key = '',
    userId = 0,
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
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
    },
  };

  // send message
  const {
    header: { method },
  } = await http.send(message);
  return method == ResponseMethod.SETACK;
}

export async function configureMqttBrokers(opts) {
  const { http, key = '', userId = 0, mqtt = [], logger } = opts ?? {};

  // create message
  const message = new Message();
  message.header.method = Method.SET;
  message.header.namespace = Namespace.CONFIG_KEY;
  message.sign(key);

  const brokers = mqtt
    ?.map((address) => {
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

  message.payload = {
    key: {
      userId: `${userId}`,
      key,
      gateway: {
        host: brokers[0].host,
        port: brokers[0].port,
        secondHost: brokers[brokers.length > 1 ? 1 : 0].host,
        secondPort: brokers[brokers.length > 1 ? 1 : 0].port,
        redirect: 1,
      },
    },
  };

  // send message
  const {
    header: { method },
  } = await http.send(message);
  return method == ResponseMethod.SETACK;
}

export async function configureWifiParameters(opts) {
  const {
    http,
    key = '',
    userId = 0,
    parameters: { credentials, ...parameters },
    logger,
  } = opts ?? {};

  // create message
  const message = new Message();
  message.header.method = Method.SET;
  message.header.namespace = Namespace.CONFIG_WIFI;
  message.sign(key);

  message.payload = {
    wifi: {
      ...filterUndefined(parameters),
      ssid: base64.encode(credentials.ssid),
      password: base64.encode(credentials.password),
    },
  };

  // send message
  const {
    header: { method },
  } = await http.send(message);
  return method == ResponseMethod.SETACK;
}

export async function queryDeviceTime(opts) {
  const { http, key = '', userId = 0, logger } = opts ?? {};

  // create message
  const message = new Message();
  message.header.method = Method.GET;
  message.header.namespace = Namespace.SYSTEM_TIME;
  message.sign(key);

  // send message
  const { time } = await http.send(message);
  return time;
}
