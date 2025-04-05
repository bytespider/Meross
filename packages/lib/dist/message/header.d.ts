export declare enum Method {
    GET = "GET",
    SET = "SET"
}
export declare enum ResponseMethod {
    GETACK = "GETACK",
    SETACK = "SETACK"
}
export declare const ResponseMethodLookup: {
    GET: ResponseMethod;
    SET: ResponseMethod;
};
export declare enum Namespace {
    SYSTEM_ALL = "Appliance.System.All",
    SYSTEM_FIRMWARE = "Appliance.System.Firmware",
    SYSTEM_HARDWARE = "Appliance.System.Hardware",
    SYSTEM_ABILITY = "Appliance.System.Ability",
    SYSTEM_ONLINE = "Appliance.System.Online",
    SYSTEM_REPORT = "Appliance.System.Report",
    SYSTEM_DEBUG = "Appliance.System.Debug",
    SYSTEM_CLOCK = "Appliance.System.Clock",
    SYSTEM_TIME = "Appliance.System.Time",
    SYSTEM_GEOLOCATION = "Appliance.System.Position",
    ENCRYPT_ECDHE = "Appliance.Encrypt.ECDHE",
    ENCRYPT_SUITE = "Appliance.Encrypt.Suite",
    CONTROL_BIND = "Appliance.Control.Bind",
    CONTROL_UNBIND = "Appliance.Control.Unbind",
    CONTROL_TRIGGER = "Appliance.Control.Trigger",
    CONTROL_TRIGGERX = "Appliance.Control.TriggerX",
    CONFIG_WIFI = "Appliance.Config.Wifi",
    CONFIG_WIFIX = "Appliance.Config.WifiX",
    CONFIG_WIFI_LIST = "Appliance.Config.WifiList",
    CONFIG_TRACE = "Appliance.Config.Trace",
    CONFIG_KEY = "Appliance.Config.Key",
    CONTROL_TOGGLE = "Appliance.Control.Toggle",
    CONTROL_TOGGLEX = "Appliance.Control.ToggleX",
    CONTROL_ELECTRICITY = "Appliance.Control.Electricity",
    CONTROL_CONSUMPTION = "Appliance.Control.Consumption",
    CONTROL_CONSUMPTIONX = "Appliance.Control.ConsumptionX",
    CONTROL_LIGHT = "Appliance.Control.Light",
    GARAGE_DOOR_STATE = "Appliance.GarageDoor.State",
    ROLLER_SHUTTER_STATE = "Appliance.RollerShutter.State",
    ROLLER_SHUTTER_POSITION = "Appliance.RollerShutter.Position",
    ROLLER_SHUTTER_CONFIG = "Appliance.RollerShutter.Config",
    CONTROL_SPRAY = "Appliance.Control.Spray",
    SYSTEM_DIGEST_HUB = "Appliance.Digest.Hub",
    HUB_EXCEPTION = "Appliance.Hub.Exception",
    HUB_BATTERY = "Appliance.Hub.Battery",
    HUB_TOGGLEX = "Appliance.Hub.ToggleX",
    HUB_ONLINE = "Appliance.Hub.Online",
    HUB_SENSOR_ALL = "Appliance.Hub.Sensor.All",
    HUB_SENSOR_TEMPHUM = "Appliance.Hub.Sensor.TempHum",
    HUB_SENSOR_ALERT = "Appliance.Hub.Sensor.Alert",
    HUB_MTS100_ALL = "Appliance.Hub.Mts100.All",
    HUB_MTS100_TEMPERATURE = "Appliance.Hub.Mts100.Temperature",
    HUB_MTS100_MODE = "Appliance.Hub.Mts100.Mode",
    HUB_MTS100_ADJUST = "Appliance.Hub.Mts100.Adjust"
}
export type HeaderOptions = {
    from?: string;
    messageId?: string;
    timestamp?: number;
    sign?: string;
    method?: Method;
    namespace?: Namespace;
};
export declare class Header {
    method: Method;
    namespace: Namespace;
    from?: string;
    messageId?: string;
    timestamp?: number;
    payloadVersion?: number;
    sign?: string;
    /**
     * @param {Object} [opts]
     * @param {string} [opts.from]
     * @param {string} [opts.messageId]
     * @param {number} [opts.timestamp]
     * @param {string} [opts.sign]
     * @param {Method} [opts.method]
     * @param {Namespace} [opts.namespace]
     */
    constructor(options?: HeaderOptions);
}
