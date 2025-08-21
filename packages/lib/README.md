# Meross Library

A TypeScript/JavaScript library for interacting with Meross smart home devices.

## Installation

```bash
npm install @meross/lib
```

## Basic Usage

```typescript
import { HTTPTransport, Device, CloudCredentials } from '@meross/lib';

async function main() {
  // Setup credentials (use userId: 0 and key: 'meross' for local devices)
  const credentials = new CloudCredentials(0, 'meross');

  // Create HTTP transport
  const transport = new HTTPTransport({
    url: 'http://192.168.1.100/config',
    credentials,
  });

  // Initialize device
  const device = new Device();
  device.setTransport(transport);

  // Get device information
  const deviceInfo = await device.fetchDeviceInfo();
  console.log('Device Info:', deviceInfo);

  // Get device abilities
  const abilities = await device.fetchDeviceAbilities();
  console.log('Device Abilities:', abilities);
}

main().catch(console.error);
```

## Core Components

### Device

The `Device` class is the primary interface for communicating with Meross devices:

```typescript
import { Device, WifiAccessPoint, CloudCredentials } from '@meross/lib';

// Create device instance
const device = new Device();

// Connect to device
device.setTransport(transport);

// Fetch device information
const info = await device.fetchDeviceInfo();

// Check device abilities
const abilities = await device.fetchDeviceAbilities();

// Check if device has a specific ability
const hasEncryption = device.hasAbility(Namespace.ENCRYPT_ECDHE);

// Configure WiFi
const wifiAP = new WifiAccessPoint({
  ssid: 'MyNetwork',
  password: 'MyPassword',
  encryption: 3,
  cipher: 1,
});
await device.configureWifi(wifiAP);

// Configure MQTT brokers
const credentials = new CloudCredentials(123, 'sharedKey');
await device.configureMQTTBrokersAndCredentials(
  ['mqtt://broker.example.com'],
  credentials,
);

// Configure device time
await device.configureDeviceTime(
  Date.now() / 1000,
  Intl.DateTimeFormat().resolvedOptions().timeZone,
);

// Get nearby WiFi networks
const nearbyNetworks = await device.fetchNearbyWifi();
```

### Transport

The library includes an HTTP transport for device communication:

```typescript
import { HTTPTransport, CloudCredentials } from '@meross/lib';

// Create credentials
const credentials = new CloudCredentials(0, 'meross');

// Create transport with device URL
const transport = new HTTPTransport({
  url: 'http://192.168.1.100/config',
  credentials,
  timeout: 15000, // Optional custom timeout (default: 10000ms)
});
```

### Device Manager

For managing multiple devices:

```typescript
import { DeviceManager, HTTPTransport, Device } from '@meross/lib';

// Create shared transport
const transport = new HTTPTransport({
  url: 'http://192.168.1.100/config',
  credentials: { userId: 0, key: 'meross' },
});

// Create device manager
const deviceManager = new DeviceManager({ transport });

// Add devices
const device1 = new Device();
deviceManager.addDevice(device1);

// Get all devices
const devices = deviceManager.getDevices();

// Get specific device
const device = deviceManager.getDeviceById('device-uuid');

// Send message to device
const message = new Message();
await deviceManager.sendMessageToDevice(device, message);
```

## Encryption

The library supports ECDH key exchange for encrypted communication:

```typescript
import {
  generateKeyPair,
  createKeyPair,
  computePresharedPrivateKey,
} from '@meross/lib';

// Method 1: Generate new key pair
const { privateKey, publicKey } = await generateKeyPair();

// Method 2: Create key pair from existing private key
const keyPair = await createKeyPair(privateKey);

// Method 3: Use precomputed key based on device info
const precomputedKey = computePresharedPrivateKey(
  deviceId,
  sharedKey,
  macAddress,
);

// Configure device with private key
await device.setPrivateKey(Buffer.from(privateKeyBase64, 'base64'));

// Exchange keys with the device
await device.exchangeKeys();
```

## WiFi Configuration

Configure a device's WiFi connection:

```typescript
import { WifiAccessPoint } from '@meross/lib';

// Create WiFi access point configuration
const wifiConfig = new WifiAccessPoint({
  ssid: 'MyNetworkName',
  password: 'MySecurePassword',
  encryption: 3, // WPA2 PSK
  cipher: 1, // CCMP (AES)
  channel: 6, // 2.4GHz channel
  bssid: '00:11:22:33:44:55', // Optional
});

// Configure device
await device.configureWifi(wifiConfig);
```

## MQTT Configuration

Configure a device to connect to MQTT brokers:

```typescript
import { CloudCredentials } from '@meross/lib';

// Create credentials
const credentials = new CloudCredentials(userId, sharedKey);

// Configure MQTT brokers (supports up to 2 brokers)
const mqttServers = [
  'mqtt://primary-broker.example.com:1883',
  'mqtts://backup-broker.example.com:8883',
];

await device.configureMQTTBrokersAndCredentials(mqttServers, credentials);
```

## Error Handling

```typescript
try {
  await device.fetchDeviceInfo();
} catch (error) {
  console.error('Error communicating with device:', error.message);

  // For detailed logs
  if (process.env.LOG_LEVEL) {
    console.error('Error stack:', error.stack);
  }
}
```

## Advanced Example: Complete Device Setup

```typescript
import {
  HTTPTransport,
  Device,
  WifiAccessPoint,
  CloudCredentials,
  Namespace,
  generateTimestamp,
  computePresharedPrivateKey,
} from '@meross/lib';

async function setupDevice(ip, wifiSettings, mqttServers) {
  // Create credentials and transport
  const credentials = new CloudCredentials(0, 'meross');
  const transport = new HTTPTransport({
    url: `http://${ip}/config`,
    credentials,
  });

  // Initialize device
  const device = new Device();
  device.setTransport(transport);

  // Get device info
  const deviceInfo = await device.fetchDeviceInfo();
  console.log(`Connected to ${deviceInfo.system.hardware.type}`);

  // Get abilities
  await device.fetchDeviceAbilities();

  // Set up encryption if supported
  if (device.hasAbility(Namespace.ENCRYPT_ECDHE)) {
    // Use pre-computed key based on device information
    const privateKey = computePresharedPrivateKey(
      device.id,
      credentials.key,
      device.hardware.macAddress,
    );

    await device.setPrivateKey(Buffer.from(privateKey, 'base64'));
    await device.exchangeKeys();
    console.log('Encryption keys exchanged');
  }

  // Configure time
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const time = generateTimestamp();
  await device.configureDeviceTime(time, timezone);
  console.log('Device time configured');

  // Configure MQTT (if provided)
  if (mqttServers && mqttServers.length) {
    await device.configureMQTTBrokersAndCredentials(mqttServers, credentials);
    console.log('MQTT servers configured');
  }

  // Configure WiFi (if provided)
  if (wifiSettings) {
    const wifiAccessPoint = new WifiAccessPoint(wifiSettings);
    const success = await device.configureWifi(wifiAccessPoint);

    if (success) {
      console.log('WiFi configured successfully, device will reboot');
    }
  }

  return device;
}

// Usage example
setupDevice(
  '10.10.10.1',
  {
    ssid: 'HomeNetwork',
    password: 'SecurePassword',
    encryption: 3,
    cipher: 1,
    channel: 6,
  },
  ['mqtts://broker.example.com:8883'],
).catch(console.error);
```

## API Reference

See the TypeScript definitions for complete API details.

### Main Classes

- `Device` - Core class for interacting with Meross devices
- `DeviceManager` - Manages multiple devices with a shared transport
- `HTTPTransport` - HTTP communication transport
- `CloudCredentials` - Authentication credentials
- `WifiAccessPoint` - WiFi configuration

### Namespaces

The library defines standard Meross namespace constants in `Namespace`:

```typescript
import { Namespace } from '@meross/lib';

// Examples:
Namespace.SYSTEM_ALL;
Namespace.SYSTEM_ABILITY;
Namespace.ENCRYPT_ECDHE;
Namespace.CONFIG_WIFI;
```

## License

ISC
