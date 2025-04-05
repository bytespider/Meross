"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudCredentials = void 0;
exports.createCloudCredentials = createCloudCredentials;
exports.getCloudCredentials = getCloudCredentials;
exports.hasCloudCredentials = hasCloudCredentials;
exports.clearCloudCredentials = clearCloudCredentials;
class CloudCredentials {
    userId;
    key;
    constructor(userId = 0, key = '') {
        this.userId = userId;
        this.key = key;
    }
}
exports.CloudCredentials = CloudCredentials;
let instance = null;
function createCloudCredentials(userId, key) {
    if (!instance) {
        instance = new CloudCredentials(userId, key);
    }
    return instance;
}
function getCloudCredentials() {
    if (!instance) {
        throw new Error('Cloud credentials have not been initialized.');
    }
    return instance;
}
function hasCloudCredentials() {
    return instance !== null;
}
function clearCloudCredentials() {
    instance = null;
}
