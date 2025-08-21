import { test } from 'node:test';
import assert from 'node:assert';
import { DeviceManager } from './deviceManager.js';
import { Device } from './device.js';
import { Namespace } from './message/header.js';
import { TransportSendOptions, Transport } from './transport/transport.js';
import { Message } from './message/message.js';

class MockTransport extends Transport {
  id: string = '';
  timeout: number = 10_000;

  protected _send(options: TransportSendOptions): Promise<any> {
    throw new Error('Method not implemented.');
  }

  send(data: any): Promise<any> {
    return Promise.resolve(data);
  }
}

class MockDevice extends Device {
  constructor(id: string, sharedKey?: string) {
    super();

    this.hardware.uuid = id;

    if (sharedKey) {
      this.encryptionKeys = {
        publicKey: undefined,
        remotePublicKey: undefined,
        sharedKey: Buffer.from(sharedKey),
      };
    }
  }

  hasAbility(namespace: Namespace): boolean {
    return namespace === Namespace.ENCRYPT_ECDHE;
  }
}

test('DeviceManager should add and retrieve devices', () => {
  const transport = new MockTransport();
  const deviceManager = new DeviceManager({ transport });

  const device = new MockDevice('device-1');
  deviceManager.addDevice(device);

  const retrievedDevice = deviceManager.getDeviceById('device-1');
  assert.strictEqual(retrievedDevice, device);
});

test('DeviceManager should remove devices by instance', () => {
  const transport = new MockTransport();
  const deviceManager = new DeviceManager({ transport });

  const device = new MockDevice('device-1');
  deviceManager.addDevice(device);
  deviceManager.removeDevice(device);

  const retrievedDevice = deviceManager.getDeviceById('device-1');
  assert.strictEqual(retrievedDevice, undefined);
});

test('DeviceManager should remove devices by ID', () => {
  const transport = new MockTransport();
  const deviceManager = new DeviceManager({ transport });

  const device = new MockDevice('device-1');
  deviceManager.addDevice(device);
  deviceManager.removeDeviceById('device-1');

  const retrievedDevice = deviceManager.getDeviceById('device-1');
  assert.strictEqual(retrievedDevice, undefined);
});

test('DeviceManager should send messages to devices', async () => {
  const transport = new MockTransport({
    credentials: { userId: 123, key: 'secretKey' },
  });
  const deviceManager = new DeviceManager({
    transport,
  });

  const device = new MockDevice('device-1', 'sharedKey');
  deviceManager.addDevice(device);

  const message = new Message();
  const response = await deviceManager.sendMessageToDevice(device, message);

  assert.deepStrictEqual(response, {
    message,
    encryptionKey: undefined,
  });
});

test('DeviceManager should throw an error if device is not found', async () => {
  const transport = new MockTransport();
  const deviceManager = new DeviceManager({ transport });

  await assert.rejects(
    async () =>
      deviceManager.sendMessageToDevice('non-existent-device', new Message()),
    new Error('Device with ID non-existent-device not found')
  );
});

test('DeviceManager shouldEncryptMessage returns true for devices requiring encryption', () => {
  const transport = new MockTransport();
  const deviceManager = new DeviceManager({ transport });

  const device = new MockDevice('device-1');
  device.hasAbility = (namespace: Namespace) =>
    namespace === Namespace.ENCRYPT_ECDHE;

  const message = { header: { namespace: 'custom' } };

  const result = (deviceManager as any).shouldEncryptMessage(device, message);
  assert.strictEqual(result, true);
});

test('DeviceManager shouldEncryptMessage returns false for devices not requiring encryption', () => {
  const transport = new MockTransport();
  const deviceManager = new DeviceManager({ transport });

  const device = new MockDevice('device-1');
  device.hasAbility = () => false;

  const message = { heaader: { namespace: 'custom' } };

  const result = (deviceManager as any).shouldEncryptMessage(device, message);
  assert.strictEqual(result, false);
});

test('DeviceManager shouldEncryptMessage returns false for excluded namespaces', () => {
  const transport = new MockTransport();
  const deviceManager = new DeviceManager({ transport });

  const device = new MockDevice('device-1');
  device.hasAbility = (namespace: Namespace) =>
    namespace === Namespace.ENCRYPT_ECDHE;

  const excludedNamespaces = [
    Namespace.SYSTEM_ALL,
    Namespace.SYSTEM_FIRMWARE,
    Namespace.SYSTEM_ABILITY,
    Namespace.ENCRYPT_ECDHE,
    Namespace.ENCRYPT_SUITE,
  ];

  for (const namespace of excludedNamespaces) {
    const message = { header: { namespace } };
    const result = (deviceManager as any).shouldEncryptMessage(device, message);
    assert.strictEqual(result, false, `Failed for namespace: ${namespace}`);
  }
});
