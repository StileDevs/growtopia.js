# Growtopia.js

A fork of [GrowSockets](https://github.com/Pogtopia/GrowSockets) to create a growtopia private servers.

## Requirements

- [Node.js v12+](https://nodejs.org/en)
- [C++ Build Tools](https://visualstudio.microsoft.com/vs/features/cplusplus/) (Linux: build-essential)
- [Python 3](https://www.python.org/downloads/)

## Installation

- Soon

## Example

```js
const { Client, TextPacket, Peer } = require("growtopia.js");

const client = new Client("127.0.0.1", 17091);

client.on("connect", (netID) => {
  console.log(`Connected netID ${netID}`);
  const peer = new Peer(client, netID);
  peer.send(TextPacket.from(0x1));
});

client.on("disconnect", (netID) => {
  console.log(`Disconnected netID ${netID}`);
});

client.on("raw", (netID, data) => {
  const type = data.readInt32LE();
  const parsed = client.parseAction(data);

  if (type === 3) {
    if (parsed.action === "quit") {
      client._client.disconnect(netID);
    }
  }
  console.log({ netID, type, parsed });
});

console.log(`Started ENet server ${client.config.port} on ${client.config.ip}`);
```

## Documentation

- [https://jadlionhd.github.io/growtopia.js/](https://jadlionhd.github.io/growtopia.js/)

## Credits

Give a thumbs to these cool people

- [Syn9673](https://github.com/Syn9673) - with his [GrowSockets](https://github.com/Pogtopia/GrowSockets).
