import TerminalKit from "terminal-kit";
import { base64, computeDevicePassword } from './util.js';

const { terminal } = TerminalKit;

const tableOptions = {
    hasBorder: true,
    borderChars: 'light',
    contentHasMarkup: true,
    fit: true,
    width: 80,
    firstColumnTextAttr: { color: 'yellow' }
}

export const percentToColor = percent => percent > .7 ? '^G' : (percent > .5 ? '^Y' : (percent > .30 ? '^y' : '^r'));

export const bar = (percent, width) => {
    const partials = ['▏', '▎', '▍', '▌', '▋', '▊', '▉'];
    let ticks = percent * width;
    if (ticks < 0) {
        ticks = 0;
    }
    let filled = Math.floor(ticks);
    let open = bar.width - filled - 1;
    return (percentToColor(percent) + '▉').repeat(filled) + partials[Math.floor((ticks - filled) * partials.length)] + ' '.repeat(open);
}

export async function printDeviceTable(deviceInformation, deviceAbility = null, deviceTime = null) {
    const { system: { hardware: hw, firmware: fw } } = deviceInformation;

    const rows = [
        ['Device', `${hw.type} ${hw.subType} ${hw.chipType} (hardware:${hw.version} firmware:${fw.version})`],
        ['UUID', hw.uuid],
        ['Mac address', hw.macAddress],
        ['IP address', fw.innerIp],
    ];

    if (fw.server) {
        rows.push(
            ['Current MQTT broker', `${fw.server}:${fw.port}`]
        );
    };

    rows.push(
        ['Credentials', `User: ^C${hw.macAddress}\nPassword: ^C${computeDevicePassword(hw.macAddress, fw.userId)}`],
        ['MQTT topics', `Publishes to: ^C/appliance/${hw.uuid}/publish\nSubscribes to: ^C/appliance/${hw.uuid}/subscribe`]
    );

    if (deviceAbility) {
        const abilityRows = [];
        for (const [ability, params] of Object.entries(deviceAbility)) {
            abilityRows.push(`${ability.padEnd(38)}\t${JSON.stringify(params)}`);
        }

        rows.push([
            'Ability', abilityRows.join("\n")
        ]);
    }

    if (deviceTime) {
        const date = new Date(deviceTime.timestamp * 1000);
        rows.push([
            'System Time', new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'long', timeZone: deviceTime.timeZone }).format(date)
        ]);
    }

    terminal.table(
        rows,
        tableOptions
    );
}

export async function printWifiListTable(wifiList) {
    const rows = [
        ['WIFI', 'Signal strength'],
    ];

    for (const { ssid, bssid, channel, encryption, cipher, signal } of wifiList) {
        const decodedSsid = base64.decode(ssid);
        rows.push([
            `${decodedSsid ? decodedSsid : '<hidden>'}\n^B${bssid}^ ^+^YCh:^ ${channel} ^+^YEncryption:^ ${encryption} ^+^YCipher:^ ${cipher}`,
            bar((signal / 100), 20)
        ])
    }

    const thisTableOptions = tableOptions;
    thisTableOptions.firstColumnVoidAttr = { contentWidth: 55 };
    thisTableOptions.firstColumnTextAttr = { color: 'cyan' }
    thisTableOptions.firstRowTextAttr = { color: 'yellow' }

    terminal.table(
        rows,
        thisTableOptions
    )
}