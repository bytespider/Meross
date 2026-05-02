# Meross utilities

[![Node.js Package](https://github.com/bytespider/Meross/actions/workflows/npm-ghr-publish.yml/badge.svg)](https://github.com/bytespider/Meross/actions/workflows/npm-ghr-publish.yml)

Tools to help configure Meross devices to use private MQTT servers.

## Requirements

Node.js: >=18

## Setup

### Devices with WiFi pairing

1. Put the device in AP mode (usually: hold the power button until the LED
   blinks orange/amber).
2. Connect your computer to the device's WiFi network (typically named
   `Meross_XXXX` or similar).
3. Run `npx meross info` to verify the device is reachable.
4. Run `npx meross setup` to configure WiFi and MQTT settings.

### Devices with Bluetooth pairing

Bluetooth-paired devices are not yet supported by this tool. See the
[Meross community wiki](https://github.com/bytespider/Meross/wiki) for
alternative methods.

## Tools

### Info

```
npx meross info [options]

Options:
  -V, --version                   output the version number
  -a, --ip <ip>                   Send command to device with this IP address (default: "10.10.10.1")
  -u, --user <user-id>            Integer id. Used by devices connected to the Meross Cloud (default: 0)
  -k, --key <shared-key>          Shared key for generating signatures (default: "meross")
  --private-key [private-key]     Private key for ECDH key exchange. If not provided, a new one will be generated
  --with-wifi                     List WiFi Access Points near the device
  --with-ability                  List device ability list
  -q, --quiet                     Suppress all output
  -v, --verbose                   Show debugging messages
  -h, --help                      display help for command
```

### Setup

```
npx meross setup [options]

Options:
  -V, --version                            output the version number
  -a, --ip <ip>                            Send command to device with this IP address (default: "10.10.10.1")
  --wifi-ssid <wifi-ssid>                  WiFi Access Point name
  --wifi-pass <wifi-pass>                  WiFi Access Point password
  --wifi-encryption <wifi-encryption>      WiFi Access Point encryption (find this using `npx meross info --with-wifi`)
  --wifi-cipher <wifi-cipher>              WiFi Access Point cipher (find this using `npx meross info --with-wifi`)
  --wifi-bssid <wifi-bssid>                WiFi Access Point BSSID (each octet separated by a colon `:`)
  --wifi-channel <wifi-channel>            WiFi Access Point 2.4GHz channel number [1-13] (find this using `npx meross info --with-wifi`)
  --mqtt <mqtt-server>                     MQTT server address (repeatable, max 2)
  -u, --user <user-id>                     Integer id. Used by devices connected to the Meross Cloud (default: 0)
  -k, --key <shared-key>                   Shared key for generating signatures (default: "meross")
  --private-key [private-key]              Private key for ECDH key exchange. If not provided, a new one will be generated
  -t, --set-time                           Configure device time with time and timezone of current host
  -q, --quiet                              Suppress all output
  -v, --verbose                            Show debugging messages
  -h, --help                               display help for command
```
