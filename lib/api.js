'use strict';

const { URL } = require('url');

const util = require('util');
const uuid = require('uuid');
const md5 = require('md5');
const term = require('terminal-kit').terminal;
const axios = require('axios');
const crypto = require('crypto');

const axiosInstance = axios.create();
axiosInstance.defaults.timeout = 10000;

const cleanServerUrl = (server) => {
  server = /mqtts?:\/\//.test(server) ? server : 'mqtt://' + server; // add protocol
  server =
    /:(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])/.test(
      server,
    )
      ? server
      : server + ':' + (server.indexOf('mqtts://') > -1 ? 8883 : 1883);

  return server;
};

const base64Encode = (str) => Buffer.from(str).toString('base64');
const base64Decode = (str) => Buffer.from(str, 'base64').toString('utf8');

const tableOptions = {
  hasBorder: true,
  borderChars: 'light',
  contentHasMarkup: true,
  fit: true,
  width: 95,
  firstColumnTextAttr: { color: 'yellow' },
};

const percentToColor = (percent) =>
  percent > 0.7 ? '^G' : percent > 0.5 ? '^Y' : percent > 0.3 ? '^y' : '^r';

const bar = (percent, width) => {
  const partials = ['▏', '▎', '▍', '▌', '▋', '▊', '▉'];
  let ticks = percent * width;
  if (ticks < 0) {
    ticks = 0;
  }
  let filled = Math.floor(ticks);
  let open = bar.width - filled - 1;
  return (
    (percentToColor(percent) + '▉').repeat(filled) +
    partials[Math.floor((ticks - filled) * partials.length)] +
    ' '.repeat(open)
  );
};

const filterUndefined = (obj) => {
  for (const key in obj) {
    if (undefined === obj[key]) {
      delete obj[key];
    }
  }

  return obj;
};

function logRequest(request) {
  const url = new URL(request.url, 'http://unknown');
  const method = request.method ? request.method.toUpperCase() : 'GET';

  console.log(`> ${method} ${url.path}`);
  console.log(`> Host: ${url.host}`);

  if (request.headers) {
    let headers = {
      ...request.headers.common,
      ...request.headers[method],
      ...Object.fromEntries(
        Object.entries(request?.headers).filter(([header]) => !['common', 'delete', 'get', 'head', 'post', 'put', 'patch'].includes(header)
        )),
    };

    for (let [header, value] of Object.entries(headers)) {
      console.log(`> ${header}: ${value}`);
    }
  }

  console.log('>');
  console.log(util.inspect(request.data, { showHidden: false, depth: null }));
  console.log('');
}

function logResponse(response) {
  console.log(`< ${response.status} ${response.statusText}`);
  for (const [header, value] of Object.entries(response.headers)) {
    console.log(`< ${header}: ${value}`);
  }
  console.log('<');
  console.log(util.inspect(response.data, { showHidden: false, depth: null }));
  console.log('');
}

function handleRequestError(error, verbose) {
  if (error.code === 'HPE_CR_EXPECTED') {
    console.error(`Please append NODE_OPTIONS='--insecure-parser' to your command.`);
    process.exit(1);
  }

  if (error.code === 'ECONNRESET' || error.code === 'ECONNABORTED') {
    let hint = '';
    if (error.config.url === 'http://10.10.10.1/config') {
      hint = "\nAre you connected to the device's Access Point?";
    }
    console.error('Error', 'Unable to connect to device' + hint);
    process.exit(1);
  }

  if (verbose) {
    if (error.response) {
      logResponse(error.response);
    } else if (error.request) {
      logRequest(error.request);
    } else {
      console.error('Error', error.message);
    }
  } else {
    console.error('Error', 'Unable to connect to device');
  }
}

module.exports = class API {
  constructor(host, key, userId, verbose = false) {
    this.host = host;
    this.key = key;
    this.userId = userId;
    this.verbose = verbose;

    axiosInstance.interceptors.request.use((request) => {
      if (verbose) {
        logRequest(request);
      }
      return request;
    });

    axiosInstance.interceptors.response.use((response) => {
      if (verbose) {
        logResponse(response);
      }
      return response;
    });
  }

  signPacket(packet) {
    const messageId = md5(uuid.v4());
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = md5(messageId + this.key + timestamp);

    packet.header.messageId = messageId;
    packet.header.timestamp = timestamp;
    packet.header.sign = signature;

    return packet;
  }

  async deviceInformation() {
    const data = await this.deviceInformationData();

    const system = data.system;
    const digest = data.digest;
    const hw = system.hardware;
    const fw = system.firmware;

    let rows = [
      [
        'Device',
        `${hw.type} ${hw.subType} ${hw.chipType} (hardware:${hw.version} firmware:${fw.version})`,
      ],
      ['UUID', hw.uuid],
      ['Mac address', hw.macAddress],
      ['IP address', fw.innerIp],
    ];

    if (fw.server) {
      rows.push(['Current MQTT broker', `${fw.server}:${fw.port}`]);
    }

    rows.push(
      [
        'Credentials',
        `User: ^C${hw.macAddress}\nPassword: ^C${this.calculateDevicePassword(
          hw.macAddress,
          fw.userId,
        )}`,
      ],
      [
        'MQTT topics',
        `Publishes to: ^C/appliance/${hw.uuid}/publish\nSubscribes to: ^C/appliance/${hw.uuid}/subscribe`,
      ],
    );

    term.table(rows, tableOptions);
  }

  async deviceInformationData() {
    const packet = this.signPacket({
      header: {
        from: '',
        method: 'GET',
        namespace: 'Appliance.System.All',
      },
      payload: {},
    });

    try {
      const response = await axiosInstance.post(
        `http://${this.host}/config`,
        packet,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data = response.data;

      if ('error' in data.payload) {
        let { code, message } = data.payload.error;

        switch (code) {
          case 5001:
            console.error('Incorrect shared key provided.');
            break;
        }

        return;
      }

      return data.payload.all;
    } catch (error) {
      handleRequestError(error, this.verbose);
    }
  }

  async deviceWifiList() {
    const packet = this.signPacket({
      header: {
        from: '',
        method: 'GET',
        namespace: 'Appliance.Config.WifiList',
      },
      payload: {},
    });

    try {
      let spinner = await term.spinner({
        animation: 'dotSpinner',
        rightPadding: ' ',
      });
      term('Getting WIFI list…\n');

      const response = await axiosInstance.post(
        `http://${this.host}/config`,
        packet,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      spinner.animate(false);

      const data = response.data;

      if ('error' in data.payload) {
        let { code, message } = data.payload.error;

        switch (code) {
          case 5001:
            console.error('Incorrect shared key provided.');
            break;
        }

        return;
      }

      const wifiList = data.payload.wifiList;

      let rows = [['WIFI', 'Signal strength']];

      for (const ap of wifiList) {
        const decodedSsid = base64Decode(ap.ssid);
        rows.push([
          `${decodedSsid ? decodedSsid : '<hidden>'}\n^B${ap.bssid}^ ^+^YCh:^ ${ap.channel
          } ^+^YEncryption:^ ${ap.encryption} ^+^YCipher:^ ${ap.cipher}`,
          bar(ap.signal / 100, 20),
        ]);
      }

      let thisTableOptions = tableOptions;
      thisTableOptions.firstColumnTextAttr = { color: 'cyan' };
      thisTableOptions.firstRowTextAttr = { color: 'yellow' };

      term.table(rows, tableOptions);
    } catch (error) {
      handleRequestError(error, this.verbose);
    }
  }

  async configureMqttServers(mqtt) {
    const servers = mqtt
      .map((server) => {
        server = cleanServerUrl(server);

        const url = new URL(server);
        return {
          host: url.hostname,
          port: url.port + '',
        };
      })
      .slice(0, 2);

    // make sure we set a failover server
    if (servers.length == 1) {
      servers.push(servers[0]);
    }

    let rows = [];
    for (let s = 0; s < servers.length; s++) {
      let server = servers[s];
      rows.push([
        `${s > 0 ? 'Failover' : 'Primary'} MQTT broker`,
        `${server.host}:${server.port}`,
      ]);
    }

    term.table(rows, tableOptions);

    const packet = this.signPacket({
      header: {
        from: '',
        method: 'SET',
        namespace: 'Appliance.Config.Key',
      },
      payload: {
        key: {
          userId: this.userId + '',
          key: this.key + '',
          gateway: ((servers) => {
            const gateway = servers[0];

            if (servers.length > 1) {
              gateway.secondHost = servers[1].host;
              gateway.secondPort = servers[1].port;
            }

            gateway.redirect = 1;

            return gateway;
          })(servers),
        },
      },
    });

    try {
      const response = await axiosInstance.post(
        `http://${this.host}/config`,
        packet,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      handleRequestError(error, this.verbose);
    }
  }

  async configureWifiCredentials(credentials, useWifiX = null) {
    const ssid = base64Encode(credentials.ssid);
    const namespace = useWifiX
      ? 'Appliance.Config.WifiX'
      : 'Appliance.Config.Wifi';
    const password = useWifiX
      ? await this.encryptPassword(credentials.password)
      : base64Encode(credentials.password);

    const packet = this.signPacket({
      header: {
        from: '',
        method: 'SET',
        namespace: namespace,
      },
      payload: {
        wifi: {
          ...filterUndefined(credentials),
          ssid,
          password,
        },
      },
    });

    try {
      const response = await axiosInstance.post(
        `http://${this.host}/config`,
        packet,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      handleRequestError(error, this.verbose);
    }
  }

  async encryptPassword(password) {
    const data = await this.deviceInformationData();

    return this.calculateWifiXPassword(
      password,
      data.system.hardware.type,
      data.system.hardware.uuid,
      data.system.hardware.macAddress,
    );
  }

  calculateDevicePassword(macAddress, userId = 0) {
    return `${userId}_${md5(macAddress + '' + this.key)}`;
  }

  calculateWifiXPassword(password, type, uuid, macAddress) {
    const key = Buffer.from(
      md5(type + uuid + macAddress).toString('hex'),
      'utf8',
    );
    const iv = Buffer.from('0000000000000000', 'utf8');
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    const count = Math.ceil(password.length / 16) * 16;
    const padded = password.padEnd(count, '\0');

    let encrypted = cipher.update(padded, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    return encrypted;
  }
};
