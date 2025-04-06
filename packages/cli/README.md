# Meross CLI

A command-line tool for configuring and managing Meross smart home devices.

## Installation

```bash
npm install -g meross
```

You can also run the commands without installing the package globally by using `npx`. For example:

```bash
npx meross info -a 192.168.1.100
```

## Commands

### Info

Get information about compatible Meross smart devices.

```bash
meross info [options]
```

Options:

- `-a, --ip <ip>` - Send command to device with this IP address (default: 10.10.10.1)
- `-u, --user <user-id>` - Integer ID used by devices connected to Meross Cloud (default: 0)
- `-k, --key <shared-key>` - Shared key for generating signatures (default: meross)
- `--private-key [private-key]` - Specify a private key for ECDH key exchange. If omitted, a new private key will be generated automatically. If this flag is not used, a pre-calculated private key will be applied by default.
- `--with-wifi` - List WIFI Access Points near the device
- `--with-ability` - List device ability list
- `-q, --quiet` - Suppress standard output

Example:

```bash
# Get basic information about a device
meross info -a 192.168.1.100

# Get device info and nearby WiFi networks
meross info -a 192.168.1.100 --with-wifi
```

### Setup

Setup and configure compatible Meross smart devices.

```bash
meross setup [options]
```

Options:

- `-a, --ip <ip>` - Send command to device with this IP address (default: 10.10.10.1)
- `--wifi-ssid <wifi-ssid>` - WIFI Access Point name
- `--wifi-pass <wifi-pass>` - WIFI Access Point password
- `--wifi-encryption <wifi-encryption>` - WIFI Access Point encryption
- `--wifi-cipher <wifi-cipher>` - WIFI Access Point cipher
- `--wifi-bssid <wifi-bssid>` - WIFI Access Point BSSID
- `--wifi-channel <wifi-channel>` - WIFI Access Point 2.4GHz channel number [1-13]
- `--mqtt <mqtt-server>` - MQTT server address (can be used multiple times). Supports protocols like `mqtt://` for non-secure connections and `mqtts://` for secure connections using TLS. Note that Meross MQTT requires the use of TLS.
- `-u, --user <user-id>` - Integer ID for devices connected to Meross Cloud (default: 0)
- `-k, --key <shared-key>` - Shared key for generating signatures (default: meross)
- `--private-key [private-key]` - Specify a private key for ECDH key exchange. If omitted, a new private key will be generated automatically. If this flag is not used, a pre-calculated private key will be applied by default.
- `-t, --set-time` - Configure device time with current host time and timezone
- `-q, --quiet` - Suppress standard output

Example:

```bash
# Configure device WiFi settings
meross setup -a 10.10.10.1 --wifi-ssid 'MyHomeNetwork' --wifi-pass 'MySecurePassword' --wifi-encryption 3 --wifi-cipher 1 --wifi-channel 6

# Configure device MQTT and time settings
meross setup -a 192.168.1.100 --mqtt 'mqtt://broker.example.com' -t
```

## Workflow Examples

### Initial Device Setup

Before starting, ensure the device is in pairing mode. To do this, press and hold the device's button for 5 seconds until the LED starts alternating between colors. This indicates the device is ready for setup.

1. Connect to the device's AP mode:

```bash
# Connect to the device's WiFi network (typically Meross_XXXXXX)
```

2. Get device information:

```bash
meross info -a 10.10.10.1 --with-wifi
```

3. Configure the device with your home WiFi:

```bash
meross setup -a 10.10.10.1 --wifi-ssid 'YourHomeWifi' --wifi-pass 'YourPassword' --mqtt 'mqtts://192.168.1.2'
```

### Managing Existing Devices

1. Get device information:

```bash
meross info -a 192.168.1.100
```

2. Update MQTT server configuration:

```bash
meross setup -a 192.168.1.100 --mqtt 'mqtt://192.168.1.10' --mqtt 'mqtt://backup.example.com'
```

## Troubleshooting

- If you're having trouble connecting to a device, make sure you're using the correct IP address
- For WiFi configuration, use the `info` command with `--with-wifi` to get the correct encryption, cipher, and channel values if SSID and password alone are not working.
- Set the `LOG_LEVEL` environment variable, in combination with `--quiet` for more detailed error messages

## Reporting Issues

If you encounter any issues or have feature requests, please report them on the [GitHub Issues page](https://github.com/bytespider/meross/issues). When submitting an issue, include the following details to help us resolve it faster:

- A clear description of the problem or feature request
- Steps to reproduce the issue (if applicable)
- The version of the CLI you are using
- Any relevant logs or error messages (use the `LOG_LEVEL` environment variable for detailed logs).

We appreciate your feedback and contributions!

> **Note**: When reporting issues or sharing examples, ensure that you obfuscate sensitive information such as private keys, passwords, or any other confidential data to protect your privacy and security.
> We appreciate your feedback and contributions!

## License

MIT
