![GrowtopiaJS](/.github/images/banner.png)

![Github Version](https://img.shields.io/github/package-json/v/jadlionhd/growtopia.js?style=flat-square)
![NPM Version](https://img.shields.io/npm/v/growtopia.js?style=flat-square)
![NPM Minified](https://img.shields.io/bundlephobia/min/growtopia.js?style=flat-square)

A fork of [GrowSockets](https://github.com/Pogtopia/GrowSockets) to create a growtopia private servers.

## Features

- Stable
- Built-in ItemsDat tools

## Requirements

- [Node.js v18+](https://nodejs.org/en) (No need to build from source)

## Installation

```sh
npm i growtopia.js
```

## Example

```js
import { Client, TextPacket, Peer } from "growtopia.js";

const client = new Client({
  enet: {
    ip: "0.0.0.0"
  }
});

client.on("ready", () => {
  console.log(`ENet server: port ${client.config.enet.port} on ${client.config.enet.ip}`);
});

client.on("error", (err) => {
  console.log("Something wrong", err);
});

client.on("connect", (netID) => {
  console.log(`Connected netID ${netID}`);
  const peer = new Peer(client, netID);
  peer.send(TextPacket.from(0x1));
});

client.on("disconnect", (netID) => {
  console.log(`Disconnected netID ${netID}`);
});

client.on("raw", (netID, data) => {
  const peer = new Peer(client, netID);
  console.log("raw", data);
  console.log(peer.ping, peer.state);
});

client.listen();
```

## Building

### Requirements

- [C++ Build Tools](https://visualstudio.microsoft.com/vs/features/cplusplus/) (Linux: build-essential)
- [Python (Recommeded v3.11)](https://www.python.org/downloads/)

```sh
npm i growtopia.js --build-from-source
```

## Links

- [Documentation](https://jadlionhd.github.io/growtopia.js/)
- [Discord Server](https://discord.gg/sGrxfKZY5t)

## Credits

Give a thumbs to these cool people

- [Syn9673](https://github.com/Syn9673) - with his [GrowSockets](https://github.com/Pogtopia/GrowSockets).
