export class CloudCredentials {
  userId: number;
  key: string;

  constructor(userId: number = 0, key: string = '') {
    this.userId = userId;
    this.key = key;
  }
}

let instance: CloudCredentials | null = null;

export function createCloudCredentials(
  userId: number,
  key: string
): CloudCredentials {
  if (!instance) {
    instance = new CloudCredentials(userId, key);
  }
  return instance;
}

export function getCloudCredentials(): CloudCredentials {
  if (!instance) {
    throw new Error('Cloud credentials have not been initialized.');
  }
  return instance;
}

export function hasCloudCredentials(): boolean {
  return instance !== null;
}

export function clearCloudCredentials(): void {
  instance = null;
}
