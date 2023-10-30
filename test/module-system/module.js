const { GrowApi, parseText, Variant, TextPacket, Peer, PacketTypes } = require("../../dist");

class IModule extends GrowApi {
  constructor() {
    super();
  }

  /**
   * @param {number} netID
   */
  onConnect(netID) {
    console.log("Module connected", this.client.cache);
    const peer = new Peer(this.client, netID);
    peer.send(TextPacket.from(0x1));
  }

  /**
   * @param {number} netID
   */
  onDisconnect(netID) {
    console.log("Module disconnected", this.client.cache);
  }

  /**
   * @param {number} netID
   * @param {Buffer} data
   */
  onRaw(netID, data) {
    console.log("Module raw data", this.client.cache);

    const type = data.readInt32LE();
    const peer = new Peer(this.client, netID);
    switch (type) {
      case PacketTypes.STR:
      case PacketTypes.ACTION: {
        const parsed = parseText(data);
        console.log(`Module raw ACTION/STR`, parsed);

        if (parsed?.requestedName && !parsed?.tankIDName && !parsed?.tankIDPass)
          return peer.send(Variant.from("OnConsoleMessage", "Hello there guest :D"));

        if (parsed?.requestedName && parsed?.tankIDName && parsed?.tankIDPass)
          return peer.send(Variant.from("OnConsoleMessage", "Hello World player!"));

        if (parsed.action === "quit") peer.disconnect();

        break;
      }

      case PacketTypes.TANK: {
        if (data.length < 60) {
          console.error(new Error("Received invalid tank packet"), data);
          return peer.disconnect();
        }

        const tank = TankPacket.fromBuffer(data);
        console.log("Module raw STR", tank);

        break;
      }

      default: {
        console.error(new Error(`Got unknown packet type of ${type}`), data);
        break;
      }
    }
  }
}

module.exports = IModule;
