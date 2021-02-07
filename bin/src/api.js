'use strict'

if (typeof(URL) === 'undefined') {
    var URL = class URL {
        constructor(url) {
            return require('url').parse(url)
        }
    }
}

const request = require('request-promise-native')
const util = require('util')
const uuid4 = require('uuid4');
const md5 = require('md5');

const cleanServerUrl = (server) => {
    server = /mqtts?:\/\//.test(server) ? server : 'mqtt://' + server // add protocol
    server = /:(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])/.test(server) ? server : (server + ':' + (server.indexOf('mqtts://') > -1 ? 8883 : 1883))

    return server
}

const serverRegex = /((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])|(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])):(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$/


module.exports = class API {
    constructor(host, key, userId) {
        this.host = host
        this.key = key
        this.userId = userId
    }

    signPacket(payload) {
        let messageId = md5(uuid4())
        let timestamp = Math.floor(Date.now() / 1000)
        let signature = md5(messageId + this.key + timestamp)

        payload.header.messageId = messageId
        payload.header.timestamp = timestamp
        payload.header.sign = signature

        return payload
    }

    deviceInformation() {
        let payload = {
            'header':   {
                'method': 'GET',
                'namespace': 'Appliance.System.All'
            },
            'payload': {}
        }

        payload = this.signPacket(payload)

        console.log('sending payload', util.inspect(payload, {showHidden: false, depth: null}))

        return request.post({
            url: `http://${this.host}/config`,
            headers: {
                'Content-Type': 'application/json'
            },
            json: payload
        }).catch(err => console.error(err))
    }

    configureMqttServers(mqtt) {
        let servers = mqtt/*.filter((server) => serverRegex.test(server))*/
        servers = mqtt.map((server) => {
            server = cleanServerUrl(server)

            let url = new URL(server)
            return {
                host: url.hostname,
                port: url.port
            }
        })
        
        // make sure we set a failover server
        if (servers.length == 1) {
            servers.push(servers[0]);
        }

        console.log('Setting MQTT servers', servers)

        let payload = {
            'header':   {
                'method': 'SET',
                'namespace': 'Appliance.Config.Key'
            },
            'payload': {
                'key': {
                    'gateway': ((servers) => {
                        let gateway = servers[0]

                        if (servers.length > 1) {
                            gateway.secondHost = servers[1].host
                            gateway.secondPort = servers[1].port
                        }

                        return gateway
                    })(servers.slice(0, 2)),
                    'key': this.key,
                    'userId': this.userId
                }
            }
        }

        payload = this.signPacket(payload)

        console.log('sending payload', util.inspect(payload, {showHidden: false, depth: null}))

        return request.post({
            url: `http://${this.host}/config`,
            headers: {
                'Content-Type': 'application/json'
            },
            json: payload
        }).catch(err => console.error(err))
    }

    configureWifiCredentials(credentials) {
        let payload = {
            'header':   {
                'method': 'SET',
                'namespace': 'Appliance.Config.Wifi'
            },
            'payload': {
                'wifi': {
                    "ssid": Buffer.from(credentials.ssid).toString('base64'),
                    "password": Buffer.from(credentials.password).toString('base64')
                }
            }
        }

        payload = this.signPacket(payload)

        console.log('sending payload', util.inspect(payload, {showHidden: false, depth: null}))

        return request.post({
            url: `http://${this.host}/config`,
            headers: {
                'Content-Type': 'application/json'
            },
            json: payload
        }).catch(err => console.error(err))
    }
}
