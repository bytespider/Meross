import { randomUUID } from 'node:crypto';
import { generateId, generateTimestamp } from './util.js';

/**
 * @readonly
 * @enum {string}
 */
export const Method = {
  GET: 'GET',
  SET: 'SET',
  PUSH: 'PUSH',
};

/**
 * @readonly
 * @enum {string}
 */
export const Namespace = {
  // Common abilities
  SYSTEM_ALL: 'Appliance.System.All',
  SYSTEM_ABILITY: 'Appliance.System.Ability',
  SYSTEM_ONLINE: 'Appliance.System.Online',
  SYSTEM_REPORT: 'Appliance.System.Report',
  SYSTEM_DEBUG: 'Appliance.System.Debug',
  SYSTEM_CLOCK: 'Appliance.System.Clock',
  SYSTEM_TIME: 'Appliance.System.Time',

  CONTROL_BIND: 'Appliance.Control.Bind',
  CONTROL_UNBIND: 'Appliance.Control.Unbind',
  CONTROL_TRIGGER: 'Appliance.Control.Trigger',
  CONTROL_TRIGGERX: 'Appliance.Control.TriggerX',

  CONFIG_WIFI: 'Appliance.Config.Wifi',
  CONFIG_WIFIX: 'Appliance.Config.WifiX',
  CONFIG_WIFI_LIST: 'Appliance.Config.WifiList',
  CONFIG_TRACE: 'Appliance.Config.Trace',
  CONFIG_KEY: 'Appliance.Config.Key',

  // Power plug / bulbs abilities
  CONTROL_TOGGLE: 'Appliance.Control.Toggle',
  CONTROL_TOGGLEX: 'Appliance.Control.ToggleX',
  CONTROL_ELECTRICITY: 'Appliance.Control.Electricity',
  CONTROL_CONSUMPTION: 'Appliance.Control.Consumption',
  CONTROL_CONSUMPTIONX: 'Appliance.Control.ConsumptionX',

  // Bulbs - only abilities
  CONTROL_LIGHT: 'Appliance.Control.Light',

  // Garage opener abilities
  GARAGE_DOOR_STATE: 'Appliance.GarageDoor.State',

  // Roller shutter timer
  ROLLER_SHUTTER_STATE: 'Appliance.RollerShutter.State',
  ROLLER_SHUTTER_POSITION: 'Appliance.RollerShutter.Position',
  ROLLER_SHUTTER_CONFIG: 'Appliance.RollerShutter.Config',

  // Humidifier
  CONTROL_SPRAY: 'Appliance.Control.Spray',

  SYSTEM_DIGEST_HUB: 'Appliance.Digest.Hub',

  // HUB
  HUB_EXCEPTION: 'Appliance.Hub.Exception',
  HUB_BATTERY: 'Appliance.Hub.Battery',
  HUB_TOGGLEX: 'Appliance.Hub.ToggleX',
  HUB_ONLINE: 'Appliance.Hub.Online',

  // SENSORS
  HUB_SENSOR_ALL: 'Appliance.Hub.Sensor.All',
  HUB_SENSOR_TEMPHUM: 'Appliance.Hub.Sensor.TempHum',
  HUB_SENSOR_ALERT: 'Appliance.Hub.Sensor.Alert',

  // MTS100
  HUB_MTS100_ALL: 'Appliance.Hub.Mts100.All',
  HUB_MTS100_TEMPERATURE: 'Appliance.Hub.Mts100.Temperature',
  HUB_MTS100_MODE: 'Appliance.Hub.Mts100.Mode',
  HUB_MTS100_ADJUST: 'Appliance.Hub.Mts100.Adjust',
};

export class Header {
  /**
   * @type {Method}
   * @public
   */
  method;

  /**
   * @type {Namespace}
   * @public
   */
  namespace;

  /**
   * @type {string}
   * @public
   */
  from;

  /**
   * @type {string}
   * @public
   */
  messageId;

  /**
   * @type {number}
   * @public
   */
  timestamp;

  /**
   * @type {string}
   * @public
   */
  sign;

  /**
   * @param {Object} opts 
   * @param {string} [opts.from=]
   * @param {string} [opts.messageId=] 
   * @param {number} [opts.timestamp=] 
   * @param {string} opts.sign 
   * @param {Method} opts.method 
   * @param {Namespace} opts.namespace 
   */
  constructor(opts) {
    const {
      from = `/app/meross-${randomUUID()}/`,
      messageId = generateId(),
      timestamp = generateTimestamp(),
      sign,
      method,
      namespace,
    } = opts ?? {};

    this.from = from;
    this.messageId = messageId;
    this.timestamp = timestamp;
    this.sign = sign;
    this.method = method;
    this.namespace = namespace;
  }
}