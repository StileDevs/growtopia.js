# Growtopia.js

![Github Version](https://img.shields.io/github/package-json/v/jadlionhd/growtopia.js?style=flat-square)
![NPM Version](https://img.shields.io/npm/v/growtopia.js?style=flat-square)
![NPM Minified](https://img.shields.io/bundlephobia/min/growtopia.js?style=flat-square)

A fork of [GrowSockets](https://github.com/Pogtopia/GrowSockets) to create a growtopia private servers.

## Requirements

- [Node.js v12+](https://nodejs.org/en)
- [C++ Build Tools](https://visualstudio.microsoft.com/vs/features/cplusplus/) (Linux: build-essential)
- [Python 3](https://www.python.org/downloads/)

## Installation

```sh
npm i growtopia.js
```

## Example

```js
const { Client, TextPacket, Peer } = require("growtopia.js");

const client = new Client("127.0.0.1", 17091, { https: true });

client.on("ready", () => {
  console.log(`Starting ENet server ${client.config.port} on ${client.config.ip}`);
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
  console.log("raw", data);
});

client.on("action", (peer, data) => {
  console.log("action", { peer, data });
  if (data.action === "quit") {
    peer.disconnect();
  }
});

client.on("tank", (peer, tank) => {
  console.log("tank", { peer, tank });
});

client.on("auth", (peer, data) => {
  console.log("auth", { peer, data });
});

client.listen(1024);
```

## Links

- [Documentation](https://jadlionhd.github.io/growtopia.js/)
- [Discord Server](https://discord.gg/sGrxfKZY5t)

## Credits

Give a thumbs to these cool people

- [Syn9673](https://github.com/Syn9673) - with his [GrowSockets](https://github.com/Pogtopia/GrowSockets).
