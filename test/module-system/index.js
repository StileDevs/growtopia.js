const { Client } = require("../../dist/index");
const IModule = require("./module");
const client = new Client({
  // Add a plugin here
  plugins: [new IModule()],
  enet: {
    ip: "0.0.0.0"
  }
});

client.on("ready", () => {
  console.log(
    `ENet server: port ${client.config.enet.port} on ${client.config.enet.ip}\nHttps server: port ${client.config.https.port} on ${client.config.https.ip}`
  );
});

client.on("error", (err) => {
  console.log("Something wrong", err);
});

client.listen();
