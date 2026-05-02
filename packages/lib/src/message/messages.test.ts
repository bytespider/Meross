import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  ConfigureDeviceTimeMessage,
  ConfigureECDHMessage,
  ConfigureMQTTBrokersAndCredentialsMessage,
  ConfigureWifiMessage,
  ConfigureWifiXMessage,
  QueryDeviceAbilitiesMessage,
  QueryDeviceInformationMessage,
  QueryDeviceTimeMessage,
  QueryWifiListMessage,
} from './messages.js';
import { Namespace, Method } from './header.js';

test('QueryDeviceInformationMessage should use GET / SYSTEM_ALL', () => {
  const msg = new QueryDeviceInformationMessage();
  assert.strictEqual(msg.header.method, Method.GET);
  assert.strictEqual(msg.header.namespace, Namespace.SYSTEM_ALL);
  assert.deepEqual(msg.payload, {});
});

test('QueryDeviceAbilitiesMessage should use GET / SYSTEM_ABILITY', () => {
  const msg = new QueryDeviceAbilitiesMessage();
  assert.strictEqual(msg.header.method, Method.GET);
  assert.strictEqual(msg.header.namespace, Namespace.SYSTEM_ABILITY);
});

test('QueryDeviceTimeMessage should use GET / SYSTEM_TIME', () => {
  const msg = new QueryDeviceTimeMessage();
  assert.strictEqual(msg.header.method, Method.GET);
  assert.strictEqual(msg.header.namespace, Namespace.SYSTEM_TIME);
});

test('QueryWifiListMessage should use GET / CONFIG_WIFI_LIST', () => {
  const msg = new QueryWifiListMessage();
  assert.strictEqual(msg.header.method, Method.GET);
  assert.strictEqual(msg.header.namespace, Namespace.CONFIG_WIFI_LIST);
});

test('ConfigureDeviceTimeMessage should set timestamp and timezone', () => {
  const msg = new ConfigureDeviceTimeMessage({
    timestamp: 1700000000,
    timezone: 'Europe/London',
  });

  assert.strictEqual(msg.header.method, Method.SET);
  assert.strictEqual(msg.header.namespace, Namespace.SYSTEM_TIME);
  assert.strictEqual(msg.payload.time.timestamp, 1700000000);
  assert.strictEqual(msg.payload.time.timezone, 'Europe/London');
});

test('ConfigureECDHMessage should include public key', () => {
  const publicKey = Buffer.from('test-public-key-bytes');
  const msg = new ConfigureECDHMessage({ publicKey });

  assert.strictEqual(msg.header.method, Method.SET);
  assert.strictEqual(msg.header.namespace, Namespace.ENCRYPT_ECDHE);
  assert.strictEqual(msg.payload.ecdhe.step, 1);
  // Public key should be base64 encoded
  assert.ok(typeof msg.payload.ecdhe.pubkey === 'string');
  assert.ok(msg.payload.ecdhe.pubkey.length > 0);
});

test('ConfigureWifiMessage should base64 encode SSID and password', () => {
  const msg = new ConfigureWifiMessage({
    wifiAccessPoint: {
      ssid: 'MyWiFi',
      password: 'secret',
      bssid: 'aa:bb:cc:dd:ee:ff',
      channel: 6,
    },
  });

  assert.strictEqual(msg.header.method, Method.SET);
  assert.strictEqual(msg.header.namespace, Namespace.CONFIG_WIFI);

  // SSID and password should be base64 encoded
  const wifi = msg.payload.wifi;
  assert.strictEqual(wifi.ssid, 'TXlXaUZp'); // base64 of 'MyWiFi'
  assert.strictEqual(wifi.password, 'c2VjcmV0'); // base64 of 'secret'
  assert.strictEqual(wifi.bssid, 'aa:bb:cc:dd:ee:ff');
  assert.strictEqual(wifi.channel, 6);
});

test('ConfigureWifiXMessage should use CONFIG_WIFIX namespace', () => {
  const msg = new ConfigureWifiXMessage({
    wifiAccessPoint: {
      ssid: 'MyWiFi',
      password: 'secret',
    },
  });

  assert.strictEqual(msg.header.method, Method.SET);
  assert.strictEqual(msg.header.namespace, Namespace.CONFIG_WIFIX);
  // Should still base64 encode SSID/password (inherited from ConfigureWifiMessage)
  assert.strictEqual(msg.payload.wifi.ssid, 'TXlXaUZp');
  assert.strictEqual(msg.payload.wifi.password, 'c2VjcmV0');
});

test('ConfigureMQTTBrokersAndCredentialsMessage should set gateway config', () => {
  const msg = new ConfigureMQTTBrokersAndCredentialsMessage({
    mqtt: [
      { host: 'mqtt.local', port: 1883 },
      { host: 'backup.local', port: 8883 },
    ],
    credentials: { userId: 42, key: 'my-key' },
  });

  assert.strictEqual(msg.header.method, Method.SET);
  assert.strictEqual(msg.header.namespace, Namespace.CONFIG_KEY);

  const key = msg.payload.key;
  assert.strictEqual(key.userId, '42');
  assert.strictEqual(key.key, 'my-key');
  assert.strictEqual(key.gateway.host, 'mqtt.local');
  assert.strictEqual(key.gateway.port, 1883);
  assert.strictEqual(key.gateway.secondHost, 'backup.local');
  assert.strictEqual(key.gateway.secondPort, 8883);
  assert.strictEqual(key.gateway.redirect, 1);
});

test('ConfigureMQTTBrokersAndCredentialsMessage should handle single broker', () => {
  const msg = new ConfigureMQTTBrokersAndCredentialsMessage({
    mqtt: [{ host: 'mqtt.local', port: 1883 }],
    credentials: { userId: 1, key: 'test' },
  });

  // When only one broker is provided, fallover = primary
  assert.strictEqual(msg.payload.key.gateway.host, 'mqtt.local');
  assert.strictEqual(msg.payload.key.gateway.secondHost, 'mqtt.local');
});
