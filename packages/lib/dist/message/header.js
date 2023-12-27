"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = exports.Namespace = exports.ResponseMethodLookup = exports.ResponseMethod = exports.Method = void 0;
const randomId_js_1 = __importDefault(require("../utils/randomId.js"));
var Method;
(function (Method) {
    Method["GET"] = "GET";
    Method["SET"] = "SET";
})(Method || (exports.Method = Method = {}));
var ResponseMethod;
(function (ResponseMethod) {
    ResponseMethod["GETACK"] = "GETACK";
    ResponseMethod["SETACK"] = "SETACK";
})(ResponseMethod || (exports.ResponseMethod = ResponseMethod = {}));
exports.ResponseMethodLookup = {
    [Method.GET]: ResponseMethod.GETACK,
    [Method.SET]: ResponseMethod.SETACK,
};
var Namespace;
(function (Namespace) {
    // Common abilities
    Namespace["SYSTEM_ALL"] = "Appliance.System.All";
    Namespace["SYSTEM_FIRMWARE"] = "Appliance.System.Firmware";
    Namespace["SYSTEM_HARDWARE"] = "Appliance.System.Hardware";
    Namespace["SYSTEM_ABILITY"] = "Appliance.System.Ability";
    Namespace["SYSTEM_ONLINE"] = "Appliance.System.Online";
    Namespace["SYSTEM_REPORT"] = "Appliance.System.Report";
    Namespace["SYSTEM_DEBUG"] = "Appliance.System.Debug";
    Namespace["SYSTEM_CLOCK"] = "Appliance.System.Clock";
    Namespace["SYSTEM_TIME"] = "Appliance.System.Time";
    Namespace["SYSTEM_GEOLOCATION"] = "Appliance.System.Position";
    // Encryption abilities
    Namespace["ENCRYPT_ECDHE"] = "Appliance.Encrypt.ECDHE";
    Namespace["ENCRYPT_SUITE"] = "Appliance.Encrypt.Suite";
    Namespace["CONTROL_BIND"] = "Appliance.Control.Bind";
    Namespace["CONTROL_UNBIND"] = "Appliance.Control.Unbind";
    Namespace["CONTROL_TRIGGER"] = "Appliance.Control.Trigger";
    Namespace["CONTROL_TRIGGERX"] = "Appliance.Control.TriggerX";
    // Setup abilities
    Namespace["CONFIG_WIFI"] = "Appliance.Config.Wifi";
    Namespace["CONFIG_WIFIX"] = "Appliance.Config.WifiX";
    Namespace["CONFIG_WIFI_LIST"] = "Appliance.Config.WifiList";
    Namespace["CONFIG_TRACE"] = "Appliance.Config.Trace";
    Namespace["CONFIG_KEY"] = "Appliance.Config.Key";
    // Power plug / bulbs abilities
    Namespace["CONTROL_TOGGLE"] = "Appliance.Control.Toggle";
    Namespace["CONTROL_TOGGLEX"] = "Appliance.Control.ToggleX";
    Namespace["CONTROL_ELECTRICITY"] = "Appliance.Control.Electricity";
    Namespace["CONTROL_CONSUMPTION"] = "Appliance.Control.Consumption";
    Namespace["CONTROL_CONSUMPTIONX"] = "Appliance.Control.ConsumptionX";
    // Bulbs - only abilities
    Namespace["CONTROL_LIGHT"] = "Appliance.Control.Light";
    // Garage opener abilities
    Namespace["GARAGE_DOOR_STATE"] = "Appliance.GarageDoor.State";
    // Roller shutter timer
    Namespace["ROLLER_SHUTTER_STATE"] = "Appliance.RollerShutter.State";
    Namespace["ROLLER_SHUTTER_POSITION"] = "Appliance.RollerShutter.Position";
    Namespace["ROLLER_SHUTTER_CONFIG"] = "Appliance.RollerShutter.Config";
    // Humidifier
    Namespace["CONTROL_SPRAY"] = "Appliance.Control.Spray";
    Namespace["SYSTEM_DIGEST_HUB"] = "Appliance.Digest.Hub";
    // HUB
    Namespace["HUB_EXCEPTION"] = "Appliance.Hub.Exception";
    Namespace["HUB_BATTERY"] = "Appliance.Hub.Battery";
    Namespace["HUB_TOGGLEX"] = "Appliance.Hub.ToggleX";
    Namespace["HUB_ONLINE"] = "Appliance.Hub.Online";
    // SENSORS
    Namespace["HUB_SENSOR_ALL"] = "Appliance.Hub.Sensor.All";
    Namespace["HUB_SENSOR_TEMPHUM"] = "Appliance.Hub.Sensor.TempHum";
    Namespace["HUB_SENSOR_ALERT"] = "Appliance.Hub.Sensor.Alert";
    // MTS100
    Namespace["HUB_MTS100_ALL"] = "Appliance.Hub.Mts100.All";
    Namespace["HUB_MTS100_TEMPERATURE"] = "Appliance.Hub.Mts100.Temperature";
    Namespace["HUB_MTS100_MODE"] = "Appliance.Hub.Mts100.Mode";
    Namespace["HUB_MTS100_ADJUST"] = "Appliance.Hub.Mts100.Adjust";
})(Namespace || (exports.Namespace = Namespace = {}));
class Header {
    method;
    namespace;
    from;
    messageId;
    timestamp;
    payloadVersion = 1;
    sign;
    /**
     * @param {Object} [opts]
     * @param {string} [opts.from]
     * @param {string} [opts.messageId]
     * @param {number} [opts.timestamp]
     * @param {string} [opts.sign]
     * @param {Method} [opts.method]
     * @param {Namespace} [opts.namespace]
     */
    constructor(options = {}) {
        const { from = '', messageId = (0, randomId_js_1.default)(), method = Method.GET, namespace = Namespace.SYSTEM_ALL, sign = '', timestamp = Date.now(), } = options;
        this.from = from;
        this.messageId = messageId;
        this.method = method;
        this.namespace = namespace;
        this.sign = sign;
        this.timestamp = timestamp;
    }
}
exports.Header = Header;
