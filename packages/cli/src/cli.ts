import TerminalKit from 'terminal-kit';
import { WifiAccessPoint } from '@meross/lib';
import { TextTableOptions } from 'terminal-kit/Terminal.js';

const { terminal } = TerminalKit;

const tableOptions: TextTableOptions = {
  hasBorder: true,
  borderChars: 'light',
  contentHasMarkup: true,
  fit: true,
  width: 80,
  firstColumnTextAttr: { color: 'yellow' },
};

/**
 * Converts a decimal between zero and one to TerminalKit color code
 */
export const percentToColor = (percent: number): string =>
  percent > 0.7 ? '^G' : percent > 0.5 ? '^Y' : percent > 0.3 ? '^y' : '^r';

/**
 * Draws a coloured bar of specified width
 */
export const bar = (percent: number, width: number): string => {
  const partials = ['▏', '▎', '▍', '▌', '▋', '▊', '▉'];
  let ticks = percent * width;
  if (ticks < 0) {
    ticks = 0;
  }
  let filled = Math.floor(ticks);
  let open = width - filled;

  return (
    (percentToColor(percent) + '▉').repeat(filled) +
    partials[Math.floor((ticks - filled) * partials.length)] +
    ' '.repeat(open)
  );
};

/**
 * Draws a spinner and a message that is updated on success or failire
 */
export async function progressFunctionWithMessage<T>(
  callback: () => Promise<T>,
  message: string
): Promise<T> {
  let spinner = await terminal.spinner({
    animation: 'dotSpinner',
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

export async function printDeviceTable(
  deviceInformation: Record<string, any>,
  deviceAbility?: Record<string, any>,
  devicePassword?: string
): Promise<void> {
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
    ['Credentials', `User: ^C${hw.macAddress}\nPassword: ^C${devicePassword}`],
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

  terminal.table(rows, tableOptions);
}

/**
 * Displays a list of WIFI Access Points
 * @param {object[]} wifiList
 */
export async function printWifiListTable(
  wifiList: WifiAccessPoint[]
): Promise<void> {
  const rows = [['WIFI', 'Signal strength']];

  for (const { ssid, bssid, channel, encryption, cipher, signal } of wifiList) {
    rows.push([
      `${
        ssid ? ssid : '<hidden>'
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
