export function protocolFromPort(port: number) {
  switch (port) {
    case 80:
      return 'http';
    case 443:
      return 'https';
    case 8883:
      return 'mqtts';
    case 1883:
      return 'mqtt';
  }

  throw new Error(`Unknown port ${port}`);
}

export function portFromProtocol(protocol: string) {
  switch (protocol) {
    case 'http':
      return 80;
    case 'https':
      return 443;
    case 'mqtts':
      return 8883;
    case 'mqtt':
      return 1883;
  }
  throw new Error(`Unknown protocol ${protocol}`);
}

export function isValidPort(port: number) {
  return port === 80 || port === 443 || port === 8883 || port === 1883;
}

export default {
  protocolFromPort,
  portFromProtocol,
  isValidPort,
};
