'use strict'

if (typeof(URL) === 'undefined') {
    var URL = class URL {
        constructor(url) {
            return require('url').parse(url)
        }
    }
}

const request = require('request-promise-native')

const cleanServerUrl = (server) => {
    server = /mqtts?:\/\//.test(server) ? server : 'mqtt://' + server // add protocol
    server = /:(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])/.test(server) ? server : (server + ':' + (server.indexOf('mqtts://') > -1 ? 8883 : 1883))

    return server
}

const serverRegex = /((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])|(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])):(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$/


let messageId = 0;
module.exports = class API {
    constructor(host) {
        this.host = host
    }

    get messageId() {
        return messageId + 1
    }

    deviceInformation() {
        let payload = {
            'header':   {
                'method': 'GET',
                'namespace': 'Appliance.System.All',
                'messageId': this.messageId + ''
            },
            'payload': {}
        }

        console.log('sending payload', payload)

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

        console.log('Setting MQTT servers', servers)

        let payload = {
            'header':   {
                'method': 'SET',
                'namespace': 'Appliance.Config.Key',
                'messageId': this.messageId + ''
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
                    'key': '',
                    'userId': ''
                }
            }
        }

        console.log('sending payload', payload)

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
                'namespace': 'Appliance.Config.Wifi',
                'messageId': this.messageId + ''
            },
            'payload': {
                'wifi': {
                    "ssid": Buffer.from(credentials.ssid).toString('base64'),
                    "password": Buffer.from(credentials.password).toString('base64')
                }
            }
        }

        console.log('sending payload', payload)

        return request.post({
            url: `http://${this.host}/config`,
            headers: {
                'Content-Type': 'application/json'
            },
            json: payload
        }).catch(err => console.error(err))
    }
}
