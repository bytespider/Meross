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

export default protocolFromPort;
