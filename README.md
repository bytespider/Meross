# Meross utilities
Tools to help configure the Meross devices for purpose of utilising our <a href="https://github.com/bytespider/Meross/wiki/MQTT">own MQTT servers</a>.

Before you can use the tool to setup your device you need to put it into paring mode and connect to it's Access Point. It's IP address is known as the `--gateway` parameter and is typically `10.10.10.1`.

## Info
`npx meross info --gateway <ip>` gets information from the device you are connected to in setup mode

## Setup
`npx meross setup --gateway <ip> [options]` setup device you are connected to in setup mode
