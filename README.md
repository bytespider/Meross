# Meross utilities

[![Node.js Package](https://github.com/bytespider/Meross/actions/workflows/npm-ghr-publish.yml/badge.svg)](https://github.com/bytespider/Meross/actions/workflows/npm-ghr-publish.yml)

Tools to help configure the Meross devices to use private MQTT servers.

## Requirements

NodeJS: ^21.0.0, ^20.10.0, ^18.20.0
NPM: ^10.0.0

## Setup

Requires `node` >=18  
For Node.js >=21 you need to prepend commands with `NODE_OPTIONS='--insecure-http-parser'`. This is because the responses from some (if not all) versions of the Meross firmware incorrectly terminate headers with LF instead of CRLF. [CVE-2022-32214](https://nvd.nist.gov/vuln/detail/CVE-2022-32214)

## Home Assistant

It's possible to get these devices to work with Home Assistant (HASSIO).
<a href="https://github.com/bytespider/Meross/wiki/Home-Assistant-(HASSIO)">Setup Home Assistant MQTT</a>

[Devices with Bluetooth pairing]()

## Tools

### Info

`npx meross info [--include-wifi]`
Gets information from the device you are connected to in setup mode and optionally the WIFI SSID's it can see.

### Setup

`npx meross setup [options]`
Setup device you are connected to in setup mode
