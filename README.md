[![GrowtopiaJS](/assets/images/banner.png)][github-growtopia-js-url]
[![Github Stars](https://img.shields.io/github/stars/StileDevs/growtopia.js?style=flat-square&link=https%3A%2F%2Fgithub.com%2FStileDevs%2Fgrowtopia.js)][github-star-growtopia-js-url]
[![NPM Version](https://img.shields.io/npm/v/growtopia.js?style=flat-square&link=https%3A%2F%2Fnpmjs.com%2Fpackage%2Fgrowtopia.js)][npm-growtopia-js-url]
[![NPM Downloads](https://img.shields.io/npm/dw/growtopia.js?link=https%3A%2F%2Fnpmjs.com%2Fpackage%2Fgrowtopia.js&color=blue)][npm-growtopia-js-url]
[![NPM Minified](https://img.shields.io/bundlephobia/min/growtopia.js?style=flat-square&link=https%3A%2F%2Fnpmjs.com%2Fpackage%2Fgrowtopia.js&color=blue)][npm-growtopia-js-url]
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/StileDevs/growtopia.js/CI.yml?branch=main&link=https%3A%2F%2Fgithub.com%2FStileDevs%2Fgrowtopia.js%2Factions)][github-ci-cd-growtopia-js-url]

A Rust based, cross-platform, high-performance Growtopia private server ENet framework utilizing Node.js, Bun.js.

## Features

- Stable
- Built-in ItemsDat tools

## Installation

```sh
npm i growtopia.js
```

## Example

```js
const { Client, TextPacket, Peer } = require("growtopia.js");

const client = new Client({
  enet: {
    ip: "0.0.0.0",
    port: 17091
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

client.on("raw", (netID, channelID, data) => {
  const peer = new Peer(client, netID);
  console.log("raw", data);
});

client.listen();
```

## Links

- [Documentation](https://gtjs.jad.li/)
- [Discord Server](https://discord.gg/sGrxfKZY5t)

## Credits

Give a thumbs to these cool people

- [Syn9673](https://github.com/Syn9673)

[github-growtopia-js-url]: https://github.com/StileDevs/growtopia.js
[github-ci-cd-growtopia-js-url]: https://github.com/StileDevs/growtopia.js/actions
[github-star-growtopia-js-url]: https://github.com/StileDevs/growtopia.js/stargazers
[npm-growtopia-js-url]: https://github.com/StileDevs/growtopia.js
