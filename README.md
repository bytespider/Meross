# Meross utilities

[![Node.js Package](https://github.com/bytespider/Meross/actions/workflows/npm-ghr-publish.yml/badge.svg)](https://github.com/bytespider/Meross/actions/workflows/npm-ghr-publish.yml)

Tools to help configure the Meross devices to use private MQTT servers.

## Requirements

NodeJS: ^21.0.0, ^20.10.0, ^18.20.0
NPM: ^10.0.0

## Setup

[Devices with WIFI pairing](docs/wifi-pairing.md)

[Devices with Bluetooth pairing](docs/bluetooth-pairing.md)

## Tools

### Info

```
npx meross info [options]

Options:
  -V, --version                output the version number
  -a, --ip <ip>                Send command to device with this IP address (default: "10.10.10.1")
  -u, --user <user-id>         Integer id. Used by devices connected to the Meross Cloud (default: 0)
  -k, --key <shared-key>       Shared key for generating signatures (default: "meross")
  --private-key [private-key]  Private key for ECDH key exchange. If not provided a new one will be generated
  --with-wifi                  List WIFI Access Points near the device
  --with-ability               List device ability list
  -q, --quiet                  Suppress all output (default: false)
  -h, --help                   display help for command
```

### Setup

```
npx meross setup [options]

Options:
  -V, --version                        output the version number
  -a, --ip <ip>                        Send command to device with this IP address (default: "10.10.10.1")
  --wifi-ssid <wifi-ssid>              WIFI Access Point name
  --wifi-pass <wifi-pass>              WIFI Access Point password
  --wifi-encryption <wifi-encryption>  WIFI Access Point encryption (this can be found using meross info --include-wifi)
  --wifi-cipher <wifi-cipher>          WIFI Access Point cipher (this can be found using meross info --include-wifi)
  --wifi-bssid <wifi-bssid>            WIFI Access Point BSSID (each octet seperated by a colon `:`)
  --wifi-channel <wifi-channel>        WIFI Access Point 2.4GHz channel number [1-13] (this can be found using meross info --include-wifi)
  --mqtt <mqtt-server>                 MQTT server address
  -u, --user <user-id>                 Integer id. Used by devices connected to the Meross Cloud (default: 0)
  -k, --key <shared-key>               Shared key for generating signatures (default: "meross")
  --private-key [private-key]          Private key for ECDH key exchange. If not provided a new one will be generated
  -t, --set-time                       Configure device time with time and timezone of current host
  -q, --quiet                          Suppress all output (default: false)
  -h, --help                           display help for command
```

```

```
