# Wi-Fi Pairing Tutorial for Meross Devices

This tutorial will guide you through the process of pairing your Meross device to your Wi-Fi network.

## Prerequisites

Before starting, ensure you have the following:

- A Meross device ready for setup.
- A 2.4 GHz Wi-Fi network (Meross devices do not support 5 GHz networks).
- Your Wi-Fi credentials (SSID and password).
- A computer with NPM and NodeJS 22 installed.
- The IP address of your MQTT broker, which is accepting TLS requests typically on port 8883.

---

## Step 1: Reset the Device

1. Plug in your Meross device.
2. Press and hold the reset button (usually located on the device) for 5 seconds until the LED indicator starts blinking alternately between amber and green.
3. This device is now in pairing mode.

---

## Step 2: Connect to the Device's Access Point

1. In your computer's Wi-Fi settings look for a network named `Meross_xxxx` (where `xxxx` is a unique identifier).
2. Connect to this network. No password is required.

---

## Step 3: Configure Wi-Fi Settings

1. In your computer's terminal type `npx meross info`.
2. If all is well some information about the device will be displayed.
3. To configure the WIFI and MQTT broker, type
   `npx meross setup --wifi-ssid '{% your wifi name %}' --wifi-pass '{% your wifi password %}' --mqtt 'mqtts://{% your mqtt broker ip}:{% your mqtt broker port}'`.  
   Example: `npx meross setup --wifi-ssid 'IOTWifi' --wifi-pass 'smart-homes-are-fun' --mqtt 'mqtts://192.168.1.100:8883'`
4. If all is well "Device will now reboot…" will be displayed followed by the device rebooting.

---

## Step 4: Verify Connection

Once the device connects to your Wi-Fi network, the LED indicator will stop blinking and remain solid green. Anything else means the device was not configured correctly or cannot communicate with the broker.

---

## Troubleshooting

- **Device resets after a few seconds** Double-check your Wi-Fi credentials and ensure the network is not hidden.
- **LED still blinking:** Check the Broker IP address and port and make sure it's accepting TLS connections.

For additional help and discussions, you can refer to [this GitHub discussion](https://github.com/krahabb/meross_lan/discussions/63) where users share their experiences and solutions.

---
