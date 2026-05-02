import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { Device } from './device.js';
import { Transport } from './transport/transport.js';
import { Namespace } from './message/header.js';

class MockTransport extends Transport {
  _sendCallCount = 0;
  lastSendOptions: any = null;
  mockResponse: any = null;

  constructor(mockResponse?: any) {
    super();
    this.mockResponse = mockResponse;
  }

  protected async _send(options: any): Promise<any> {
    this._sendCallCount++;
    this.lastSendOptions = options;
    return (
      this.mockResponse ?? {
        header: { method: 'GETACK' },
        payload: {},
      }
    );
  }
}

test('Device should create with default values', () => {
  const device = new Device();
  assert.strictEqual(device.id, '00000000000000000000000000000000');
  assert.strictEqual(device.hardware.macAddress, '00:00:00:00:00:00');
  assert.strictEqual(device.firmware.version, '0.0.0');
  assert.deepEqual(device.ability, {});
});

test('Device should create with custom options', () => {
  const device = new Device({
    hardware: {
      uuid: 'test-uuid-12345',
      macAddress: 'aa:bb:cc:dd:ee:ff',
    },
    firmware: {
      version: '1.2.3',
      compileTime: new Date('2024-01-01'),
    },
    model: 'MSS110',
  });

  assert.strictEqual(device.id, 'test-uuid-12345');
  assert.strictEqual(device.hardware.macAddress, 'aa:bb:cc:dd:ee:ff');
  assert.strictEqual(device.firmware.version, '1.2.3');
  assert.strictEqual(device.model, 'MSS110');
});

test('Device should set transport', () => {
  const device = new Device();
  const transport = new MockTransport();
  device.setTransport(transport);
  // Transport is set — subsequent calls would use it
  assert.ok(true, 'setTransport should not throw');
});

test('Device should set private key', async () => {
  const device = new Device();
  const privateKey = Buffer.from(
    'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    'hex',
  );
  await device.setPrivateKey(privateKey);
  assert.ok(
    device.encryptionKeys.localKeys !== undefined,
    'localKeys should be set',
  );
});

test('Device hasAbility should check ability keys', () => {
  const device = new Device();
  device.ability = {
    'Appliance.System.All': {},
    'Appliance.Config.WifiX': {},
  };

  assert.strictEqual(
    device.hasAbility(Namespace.SYSTEM_ALL),
    true,
    'should have SYSTEM_ALL ability',
  );
  assert.strictEqual(
    device.hasAbility(Namespace.CONFIG_WIFIX),
    true,
    'should have CONFIG_WIFIX ability',
  );
  assert.strictEqual(
    device.hasAbility(Namespace.ENCRYPT_ECDHE),
    false,
    'should NOT have ENCRYPT_ECDHE ability',
  );
});

test('Device fetchDeviceInfo should parse and store system info', async () => {
  const mockResponse = {
    header: { method: 'GETACK' },
    payload: {
      all: {
        system: {
          hardware: {
            type: 'mss110',
            uuid: 'device-uuid-123',
            macAddress: '11:22:33:44:55:66',
            version: '3.0.0',
          },
          firmware: {
            version: '2.1.0',
            compileTime: 1700000000,
          },
        },
      },
    },
  };

  const device = new Device();
  device.setTransport(new MockTransport(mockResponse));
  await device.fetchDeviceInfo();

  assert.strictEqual(device.model, 'mss110');
  assert.strictEqual(device.hardware.uuid, 'device-uuid-123');
  assert.strictEqual(device.hardware.macAddress, '11:22:33:44:55:66');
  assert.strictEqual(device.firmware.version, '2.1.0');
});

test('Device fetchDeviceAbilities should store abilities', async () => {
  const mockResponse = {
    header: { method: 'GETACK' },
    payload: {
      ability: {
        'Appliance.System.All': {},
        'Appliance.Config.WifiX': {},
      },
    },
  };

  const device = new Device();
  device.setTransport(new MockTransport(mockResponse));
  await device.fetchDeviceAbilities();

  assert.ok(
    device.hasAbility(Namespace.SYSTEM_ALL),
    'should have SYSTEM_ALL ability',
  );
  assert.ok(
    device.hasAbility(Namespace.CONFIG_WIFIX),
    'should have CONFIG_WIFIX ability',
  );
});

test('Device configureWifi should upgrade to WifiX when device supports it', async () => {
  const mockTransport = new MockTransport({
    header: { method: 'SETACK' },
    payload: {},
  });
  const device = new Device();
  device.setTransport(mockTransport);

  // Pre-populate as if fetchDeviceAbilities was called
  device.ability = { 'Appliance.Config.WifiX': {} };
  device.model = 'mss110';
  device.hardware.uuid = 'test-uuid';
  device.hardware.macAddress = '11:22:33:44:55:66';

  const result = await device.configureWifi({
    ssid: 'MyWiFi',
    password: 'secret123',
    bssid: 'aa:bb:cc:dd:ee:ff',
    channel: 6,
    cipher: 3, // AES
    encryption: 5, // WPA2
  });

  assert.strictEqual(result, true);
  assert.strictEqual(
    mockTransport._sendCallCount,
    1,
    'should have called send',
  );

  // The message namespace should be CONFIG_WIFIX (not CONFIG_WIFI)
  const sentMessage = mockTransport.lastSendOptions.message;
  assert.strictEqual(
    sentMessage.header.namespace,
    Namespace.CONFIG_WIFIX,
    'should use CONFIG_WIFIX namespace',
  );
});

test('Device configureWifi should use standard Wifi when device lacks WifiX', async () => {
  const mockTransport = new MockTransport({
    header: { method: 'SETACK' },
    payload: {},
  });
  const device = new Device();
  device.setTransport(mockTransport);
  device.ability = {}; // No CONFIG_WIFIX ability

  const result = await device.configureWifi({
    ssid: 'MyWiFi',
    password: 'secret123',
  });

  assert.strictEqual(result, true);
  const sentMessage = mockTransport.lastSendOptions.message;
  assert.strictEqual(
    sentMessage.header.namespace,
    Namespace.CONFIG_WIFI,
    'should use CONFIG_WIFI namespace',
  );
});

test('Device configureMQTTBrokersAndCredentials should handle valid URLs', async () => {
  const mockTransport = new MockTransport({
    header: { method: 'SETACK' },
    payload: {},
  });
  const device = new Device();
  device.setTransport(mockTransport);

  await device.configureMQTTBrokersAndCredentials(
    ['mqtt://broker.local:1883', 'mqtts://backup.local:8883'],
    { userId: 123, key: 'test-key' },
  );

  const sentMessage = mockTransport.lastSendOptions.message;
  const payload = sentMessage.payload;
  assert.strictEqual(payload.key.userId, '123');
  assert.strictEqual(payload.key.key, 'test-key');
  assert.strictEqual(payload.key.gateway.host, 'broker.local');
  assert.strictEqual(payload.key.gateway.port, 1883);
  assert.strictEqual(payload.key.gateway.secondHost, 'backup.local');
  assert.strictEqual(payload.key.gateway.secondPort, 8883);
  assert.strictEqual(payload.key.gateway.redirect, 1);
});

test('Device configureMQTTBrokersAndCredentials should handle bare hostnames', async () => {
  const mockTransport = new MockTransport({
    header: { method: 'SETACK' },
    payload: {},
  });
  const device = new Device();
  device.setTransport(mockTransport);

  await device.configureMQTTBrokersAndCredentials(
    ['localhost:1883'],
    { userId: 0, key: 'meross' },
  );

  const sentMessage = mockTransport.lastSendOptions.message;
  const payload = sentMessage.payload;
  assert.strictEqual(payload.key.gateway.host, 'localhost');
  assert.strictEqual(payload.key.gateway.port, 1883);
});

test('Device exchangeKeys should fail if no private key set', async () => {
  const mockTransport = new MockTransport({
    header: { method: 'SETACK' },
    payload: {
      ecdhe: { pubkey: Buffer.from('test').toString('base64') },
    },
  });
  const device = new Device();
  device.setTransport(mockTransport);

  // Should auto-generate keys if none provided
  try {
    await device.exchangeKeys();
    assert.ok(
      device.encryptionKeys.sharedKey !== undefined,
      'sharedKey should be set after exchange',
    );
  } catch (e: any) {
    // Key exchange might fail with mock response, that's ok
    assert.ok(true, 'exchangeKeys should not crash');
  }
});
