# Growtopia.js

![Github Version](https://img.shields.io/github/package-json/v/jadlionhd/growtopia.js?style=flat-square)
![NPM Version](https://img.shields.io/npm/v/growtopia.js?style=flat-square)
![NPM Minified](https://img.shields.io/bundlephobia/min/growtopia.js?style=flat-square)

A fork of [GrowSockets](https://github.com/Pogtopia/GrowSockets) to create a growtopia private servers.

## Requirements

- [Node.js v16+](https://nodejs.org/en)
- [C++ Build Tools](https://visualstudio.microsoft.com/vs/features/cplusplus/) (Linux: build-essential)
- [Python (Recommeded v3.11)](https://www.python.org/downloads/)

## Installation

```sh
npm i growtopia.js
```

## Example

```js
const { Client, TextPacket, Peer } = require("growtopia.js");

const client = new Client();

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
  console.log(`Peer (${peer.data.netID}) action`, { data });
  if (data.action === "quit") {
    peer.disconnect();
  }
});

client.on("tank", (peer, tank) => {
  console.log(`Peer (${peer.data.netID}) tank`, { tank });
});

client.on("text", (peer, data) => {
  console.log(peer.ping);

  console.log(`Peer (${peer.data.netID}) text`, { data });
});

client.listen();
```

## Links

- [Documentation](https://jadlionhd.github.io/growtopia.js/)
- [Discord Server](https://discord.gg/sGrxfKZY5t)

## Credits

Give a thumbs to these cool people

- [Syn9673](https://github.com/Syn9673) - with his [GrowSockets](https://github.com/Pogtopia/GrowSockets).
