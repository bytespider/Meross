export declare class CloudCredentials {
    userId: number;
    key: string;
    constructor(userId?: number, key?: string);
}
export declare function createCloudCredentials(userId: number, key: string): CloudCredentials;
export declare function getCloudCredentials(): CloudCredentials;
export declare function hasCloudCredentials(): boolean;
export declare function clearCloudCredentials(): void;
