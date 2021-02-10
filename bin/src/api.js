'use strict'

if (typeof(URL) === 'undefined') {
    var URL = class URL {
        constructor(url) {
            return require('url').parse(url)
        }
    }
}

const util = require('util')
const uuid4 = require('uuid4')
const md5 = require('md5')
const term = require( 'terminal-kit' ).terminal
const axios = require('axios')

const cleanServerUrl = (server) => {
    server = /mqtts?:\/\//.test(server) ? server : 'mqtt://' + server // add protocol
    server = /:(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])/.test(server) ? server : (server + ':' + (server.indexOf('mqtts://') > -1 ? 8883 : 1883))

    return server
}

const serverRegex = /((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])|(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])):(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$/

const base64Encode = str => Buffer.from(str).toString('base64')

const tableOptions = {
    hasBorder: true,
    borderChars: 'light',
    contentHasMarkup: true,
    fit: true,
    width: 95,
    firstColumnTextAttr: { color: 'yellow' }
}

function logRequest(request) {
    let url = new URL(request.url);
    console.log(`> ${request.method.toUpperCase()} ${url.path}`)
    console.log(`> Host: ${url.host}`)
    
    let headers = {}
    headers = Object.assign(headers, request.headers.common);
    headers = Object.assign(headers, request.headers[request.method]);
    headers = Object.assign(headers, Object.fromEntries(
        Object.entries(request.headers).filter(
            ([header]) => !['common', 'delete', 'get', 'head', 'post', 'put', 'patch'].includes(header)
        )
    ));
    for (let [header, value] of Object.entries(headers)) {
        console.log(`> ${header}: ${value}`)
    }
    
    console.log('>')
    console.log(util.inspect(request.data, {showHidden: false, depth: null}))
}

function logResponse(response)  {
    console.log(`< ${response.status} ${response.statusText}`)
    for (const [header, value] of Object.entries(response.headers)) {
        console.log(`< ${header}: ${value}`)
    }
    console.log('<')
    console.log(util.inspect(response.data, {showHidden: false, depth: null}))
}

function handleRequestError(error, verbose)
{
    if (verbose) {
        if (error.response) {
            logResponse(error.response)
        } else if (error.request) {
            logRequest(error.request)
        } else {
            console.error('Error', error.message);
        }
    } else {
        console.error('Error', 'Unable to connect to device');
    }
}

module.exports = class API {
    constructor(host, key, userId, verbose = false) {
        this.host = host
        this.key = key
        this.userId = userId
        
        axios.interceptors.request.use(request => {
            if (verbose) {
                logRequest(request)
            }
            return request
        })
        
        axios.interceptors.response.use(response => {
            if (verbose) {
                logResponse(response)
            }
            return response
        })
    }

    signPacket(packet) {
        const messageId = md5(uuid4())
        const timestamp = Math.floor(Date.now() / 1000)
        const signature = md5(messageId + this.key + timestamp)

        packet.header.messageId = messageId
        packet.header.timestamp = timestamp
        packet.header.sign = signature

        return packet
    }

    async deviceInformation() {
        const packet = this.signPacket({
            'header':   {
                'method': 'GET',
                'namespace': 'Appliance.System.All'
            },
            'payload': {}
        })

        try {
            const response = await axios.post(
                `http://${this.host}/config`,
                packet,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                }
            )
        
            const data = response.data;
            
            if ('error' in data.payload) {
                let {code, message} = data.payload.error;
        
                switch (code) {
                    case 5001:
                        console.error('Incorrect shared key provided.')
                        break;
                }
                
                return
            }
            
            const system = data.payload.all.system
            const digest = data.payload.all.digest
            const hw = system.hardware
            const fw = system.firmware
            
            let rows = [
                ['Device', `${hw.type} ${hw.subType} ${hw.chipType} (hardware:${hw.version} firmware:${fw.version})`],
                ['UUID', hw.uuid],
                ['Mac address', hw.macAddress],
                ['WIFI', `${fw.innerIp} (${fw.wifiMac})`],
            ];
            
            if (fw.server) {
                rows.push(
                    ['MQTT broker', `${fw.server}:${fw.port}`],
                    ['Status', `${system.online.status == 0 ? '^ROffline' : '^GOnline'}`]
                )
            } else {
                rows.push(
                    ['Status', `^BConfiguration`]
                )
            }
            
            rows.push(
                ['Credentials', `User: ^C${fw.userId}\nPassword: ^C${this.calculateDevicePassword(hw.macAddress, fw.userId)}`]
            )
            
            if (digest.togglex) {
                let row = ['Switch state']
                let col = []
                for (let sw of digest.togglex) {
                    let ch = [];
                    if (digest.togglex.length > 1) {
                        ch.push(`Channel ${sw.channel}:`);
                    }
                    ch.push(sw.onoff == 0 ? '^ROff' : '^GOn')
                    
                    const switchUpdateDate = new Date();
                    switchUpdateDate.setTime(sw.lmTime * 1000) // put time into ms not seconds
                    ch.push(`(${new Intl.DateTimeFormat(process.env.LC_TIME, { dateStyle: 'full', timeStyle: 'long' }).format(switchUpdateDate)})`)
                    
                    col.push(ch.join('^ '))
                }
                row.push(col.join("\n"));
                rows.push(row)
            }
            
            term.table(
                rows,
                tableOptions
            )
        } catch (error) {
            handleRequestError(error)
        }
    }

    async configureMqttServers(mqtt) {
        const servers = mqtt.map((server) => {
            server = cleanServerUrl(server)

            const url = new URL(server)
            return {
                host: url.hostname,
                port: url.port
            }
        })
        
        // make sure we set a failover server
        if (servers.length == 1) {
            servers.push(servers[0]);
        }
        
        term.table(
            [
                ['Primary MQTT broker', `${servers[0].host}:${servers[0].port}`],
                ['Secondary MQTT broker', `${servers[1].host}:${servers[1].port}`]
            ],
            tableOptions
        )

        const packet = this.signPacket({
            'header':   {
                'method': 'SET',
                'namespace': 'Appliance.Config.Key'
            },
            'payload': {
                'key': {
                    'gateway': ((servers) => {
                        const gateway = servers[0]

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
        })

        try {
            const response = await axios.post(
                `http://${this.host}/config`,
                packet,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                }
            )
        } catch (error) {
            handleRequestError(error)
        }
    }

    async configureWifiCredentials(credentials) {
        const ssid = base64Encode(credentials.ssid)
        const password = base64Encode(credentials.password)
        
        const packet = this.signPacket({
            'header':   {
                'method': 'SET',
                'namespace': 'Appliance.Config.Wifi'
            },
            'payload': {
                'wifi': {
                    "ssid": ssid,
                    "password": password
                }
            }
        })
        
        term.table(
            [
                ['Encoded WIFI SSID', `${ssid}`],
                ['Encoded WIFI password', `${password}`]
            ],
            tableOptions
        )

        try {
            const response = await axios.post(
                `http://${this.host}/config`,
                packet,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                }
            )
        } catch (error) {
            handleRequestError(error)
        }
    }
    
    calculateDevicePassword(macAddress, user = null) {
        return `${user}_${md5(macAddress + this.key)}`
    }
}
