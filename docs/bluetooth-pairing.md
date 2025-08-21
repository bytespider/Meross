# Bluetooth Pairing Tutorial for Meross Devices

This tutorial will guide you through the process of pairing your Meross device to your Wi-Fi network using bluetooth.

## Prerequisites

Before starting, ensure you have the following:

- A Meross device ready for setup.
- A 2.4 GHz Wi-Fi network (Meross devices do not support 5 GHz networks).
- Your Wi-Fi credentials (SSID and password).
- A smartphone with the Meross app installed and logged in
- A computer with NPM and NodeJS 22 installed.
- The IP address of your MQTT broker, which is accepting TLS requests typically on port 8883.

---

## Step 1: Reset the Device

1. Plug in your Meross device.
2. Press and hold the reset button (usually located on the device) for 5 seconds until the LED indicator starts blinking alternately between amber and green.
3. This device is now in pairing mode.

---

## Step 2: Connect to the Device's Access Point

1. In the Meross app, follow the instructions to add the device to your network.
2. Once the device is on your network take note of it's IP address.

---

## Step 3: Update the device to use your own MQTT broker

1. In your computer's terminal type `npx meross info -a {% IP of the device on your network %}`.
2. If all is well some information about the device will be displayed.
3. To configure MQTT broker, type
   `npx meross setup --mqtt 'mqtts://{% your mqtt broker ip}:{% your mqtt broker port}'`.  
   Example: `npx meross setup --mqtt 'mqtts://192.168.1.100:8883'`
