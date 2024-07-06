import { Client, TextPacket, Peer } from "../../dist/index.js";

const client = new Client({
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

client.on("connect", (netID) => {
  const enetPeer = client._client.getPeer(netID);

  console.log({ ping: enetPeer.getRTT() });
  console.log(enetPeer.getAddress());

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
});

client.on("action", (peer, data) => {
  console.log(`Peer (${peer.data.netID}) action`, { data });
  if (data.action === "quit") {
    peer.disconnect();
  }
});

client.listen();
