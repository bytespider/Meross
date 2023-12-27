# Meross utilities

[![Node.js Package](https://github.com/bytespider/Meross/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/bytespider/Meross/actions/workflows/npm-publish.yml)

Tools to help configure the Meross devices to use private MQTT servers.

## Requirements

NodeJS: >= 18.0  
NPM: >= 9.0

## Setup

[Devices with WIFI pairing]()

[Devices with Bluetooth pairing]()

## Tools

### Info

```
npx meross-info [options] <options>

Options:
  -V, --version           output the version number
  -a, --ip <ip>           Send command to device with this IP address (default: "10.10.10.1")
  -u, --user <user-id>    Integer id. Used by devices connected to the Meross Cloud
  -k, --key <shared-key>  Shared key for generating signatures (default: "")
  --include-wifi          List WIFI Access Points near the device
  --include-ability       List device ability list
  --include-time          List device time
  -v, --verbose           Show debugging messages
  -h, --help              display help for command
```

### Setup

```
npx meross-setup [options] <options>

Options:
  -V, --version                        output the version number
  -a, --ip <ip>                        Send command to device with this IP address (default: "10.10.10.1")
  --wifi-ssid <wifi-ssid>              WIFI Access Point name
  --wifi-pass <wifi-pass>              WIFI Access Point password
  --wifi-encryption <wifi-encryption>  WIFI Access Point encryption (this can be found using meross info --include-wifi)
  --wifi-cipher <wifi-cipher>          WIFI Access Point cipher (this can be found using meross info --include-wifi)
  --wifi-bssid <wifi-bssid>            WIFI Access Point BSSID (each octet seperated by a colon `:`)
  --wifi-channel <wifi-channel>        WIFI Access Point 2.5GHz channel number [1-13] (this can be found using meross info --include-wifi)
  --mqtt <mqtt-server>                 MQTT server address
  -u, --user <user-id>                 Integer id. Used by devices connected to the Meross Cloud (default: 0)
  -k, --key <shared-key>               Shared key for generating signatures (default: "")
  -t, --set-time                       Configure device time with time and timezone of current host
  -v, --verbose                        Show debugging messages (default: "")
  -h, --help                           display help for command
```
