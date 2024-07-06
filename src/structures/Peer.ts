import type { ClientType, PeerData } from "../../types";
import type { Sendable } from "../../types/packets";
import { Variant } from "../packets/Variant.js";
import { Client } from "./Client.js";

class Peer<T extends PeerData> {
  public data: T;

  constructor(private client: Client, netID: number) {
    this.data = {} as T;
    this.data.netID = netID;

    this.client = client;
  }

  /**
   * Sends multiple packets to a single peer.
   * @param data An argument of packets that contains the `parse()` function or just an array of Buffers.
   */
  public send(...data: Sendable[]) {
    Peer.send(this.client._client, this.data.netID, ...data);
  }

  /**
   * Sends multiple packets to a single peer.
   * @param _client The Wrapper client.
   * @param netID The netID of a peer.
   * @param data An argument of packets that contains the `parse()` function or just an array of Buffers.
   */
  public static send(_client: ClientType, netID: number, ...data: Sendable[]) {
    const packets = data.map((packet) => {
      if (Buffer.isBuffer(packet)) return packet;
      else {
        switch (packet.constructor.name) {
          case "TextPacket":
          case "TankPacket": {
            return packet.parse();
          }

          case "Variant": {
            return (packet as Variant).parse().parse();
          }

          default: {
            break;
          }
        }
      }
    });

    _client.send(netID, packets.length, packets as any[]);
  }

  /**
   * Disconnects the peer.
   * @param type Type of disconnection. Defaults to `later`.
   */
  public disconnect(type: "now" | "later" | "normal" = "later") {
    switch (type) {
      case "normal": {
        this.client._client.disconnect(this.data.netID);
        break;
      }
      case "later": {
        this.client._client.disconnectLater(this.data.netID);
        break;
      }
      case "now": {
        this.client._client.disconnectNow(this.data.netID);
        break;
      }
    }
  }
}

export { Peer };
