# Meross utilities

[![Node.js Package](https://github.com/bytespider/Meross/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/bytespider/Meross/actions/workflows/npm-publish.yml)

Tools to help configure the Meross devices for purpose of utilising our <a href="https://github.com/bytespider/Meross/wiki/MQTT">own MQTT servers</a>.

Before you can use the tool to setup your device you need to put it into paring mode and connect to it's Access Point. It's IP address is known as the `--gateway` parameter and is typically `10.10.10.1`.

Requires `node` v12+.

## Home Assistant

It's possible to get these devices to work with Home Assistant (HASSIO).
<a href="https://github.com/bytespider/Meross/wiki/Home-Assistant-(HASSIO)">Setup Home Assistant MQTT</a>

Once paired and linked to your broker, you can use the <a href="https://github.com/krahabb/meross_lan">Meross Lan</a> integration to control the devices.

## Tools

### Info

`npx meross info [--include-wifi]`
Gets information from the device you are connected to in setup mode and optionally the WIFI SSID's it can see.

### Setup

`npx meross setup [options]`
Setup device you are connected to in setup mode
