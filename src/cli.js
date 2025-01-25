import TerminalKit from 'terminal-kit';
import { program } from 'commander';
import { base64, computeDevicePassword } from './util.js';

const { terminal } = TerminalKit;

export const collection = (value, store = []) => {
  store.push(value);
  return store;
};

export const numberInRange = (min, max) => (value) => {
  if (value < min || value > max) {
    throw new program.InvalidOptionArgumentError(
      `Value is out of range (${min}-${max})`
    );
  }
  return parseInt(value);
};

export const parseIntWithValidation = (value) => {
  const i = parseInt(value);
  if (isNaN(i)) {
    throw new program.InvalidOptionArgumentError(`Value should be an integer`);
  }

  return i;
};

const tableOptions = {
  hasBorder: true,
  borderChars: 'light',
  contentHasMarkup: true,
  fit: true,
  width: 80,
  firstColumnTextAttr: { color: 'yellow' },
};

/**
 * Converts a decimal between zero and one to TerminalKit color code
 * @param {number} percent 
 * @returns 
 */
export const percentToColor = (percent) =>
  percent > 0.7 ? '^G' : percent > 0.5 ? '^Y' : percent > 0.3 ? '^y' : '^r';

/**
 * Draws a coloured bar of specified width
 * @param {number} percent 
 * @param {number} width 
 * @returns {string}
 */
export const bar = (percent, width) => {
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

/**
 * Draws a spinner and a message that is updated on success or failire
 * @param {Function} callback 
 * @param {string} message 
 * @returns 
 */
export async function progressFunctionWithMessage(callback, message) {
  let spinner = await terminal.spinner({
    animation: 'dotSpinner',
    rightPadding: ' ',
    attr: { color: 'cyan' },
  });
  terminal(`${message}…`);

  try {
    const response = await callback();
    spinner.animate(false);
    terminal.saveCursor().column(0).green('✓').restoreCursor();
    terminal('\n');
    return response;
  } catch (e) {
    terminal.saveCursor().column(0).red('✗').restoreCursor();
    terminal('\n');
    throw e;
  } finally {
    spinner.animate(false);
  }
}

/**
 * 
 * @param {object} deviceInformation 
 * @param {object} deviceAbility 
 * @param {object} deviceTime 
 */
export async function printDeviceTable(
  deviceInformation,
  deviceAbility = null,
  deviceTime = null
) {
  const {
    system: { hardware: hw, firmware: fw },
  } = deviceInformation;

  const rows = [
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
      `User: ^C${hw.macAddress}\nPassword: ^C${computeDevicePassword(
        hw.macAddress,
        fw.userId
      )}`,
    ],
    [
      'MQTT topics',
      `Publishes to: ^C/appliance/${hw.uuid}/publish\nSubscribes to: ^C/appliance/${hw.uuid}/subscribe`,
    ]
  );

  if (deviceAbility) {
    const abilityRows = [];
    for (const [ability, params] of Object.entries(deviceAbility)) {
      abilityRows.push(`${ability.padEnd(38)}\t${JSON.stringify(params)}`);
    }

    rows.push(['Ability', abilityRows.join('\n')]);
  }

  if (deviceTime) {
    const date = new Date(deviceTime.timestamp * 1000);
    const formatter = new Intl.DateTimeFormat(undefined, {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: deviceTime.timezone,
    });
    rows.push([
      'System Time',
      formatter.format(date) +
      (deviceTime.timezone ? ` (${deviceTime.timezone})` : ''),
    ]);
  }

  terminal.table(rows, tableOptions);
}

/**
 * Displays a list of WIFI Access Points
 * @param {object[]} wifiList 
 */
export async function printWifiListTable(wifiList) {
  const rows = [['WIFI', 'Signal strength']];

  for (const { ssid, bssid, channel, encryption, cipher, signal } of wifiList) {
    const decodedSsid = base64.decode(ssid);
    rows.push([
      `${decodedSsid ? decodedSsid : '<hidden>'
      }\n^B${bssid}^ ^+^YCh:^ ${channel} ^+^YEncryption:^ ${encryption} ^+^YCipher:^ ${cipher}`,
      bar(signal / 100, 20),
    ]);
  }

  const thisTableOptions = tableOptions;
  thisTableOptions.firstColumnVoidAttr = { contentWidth: 55 };
  thisTableOptions.firstColumnTextAttr = { color: 'cyan' };
  thisTableOptions.firstRowTextAttr = { color: 'yellow' };

  terminal.table(rows, thisTableOptions);
}
