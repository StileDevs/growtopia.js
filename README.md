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
const { Client } = require("growtopia.js");

const server = new Client("127.0.0.1", 17091);

server.on("connect", (netID) => {
  console.log(`Connected netID ${netID}`);
});

server.on("disconnect", (netID) => {
  console.log(`Disconnected netID ${netID}`);
});

server.on("raw", (netID, data) => {
  const type = data.readInt32LE();
  const parsed = server.parseAction(data);

  if (type === 3) {
    if (parsed.action === "quit") {
      server.client.disconnect(netID);
    }
  }
  console.log(netID, type, parsed);
});

console.log(`Starting enet server ${server.config.port} on ${server.config.ip}`);
```

## Documentation

- Soon

## Credits

Give a thumbs to these cool people

- [Syn9673](https://github.com/Syn9673) - with his [GrowSockets](https://github.com/Pogtopia/GrowSockets).
