import type { Host } from "../../native";
import type { NativePeerData, PeerData, Sendable } from "../../types";
import { Variant } from "../packets/Variant";
import { Client } from "./Client";

export class Peer<T extends PeerData> {
  public data: T;

  constructor(private client: Client, netID: number, channelID = 0) {
    this.data = {
      netID,
      channelID
    } as T;

    this.client = client;
  }

  public get enet(): NativePeerData {
    return this.client.host.getPeerData(this.data.netID) as NativePeerData;
  }

  /**
   * Sends multiple packets to a single peer.
   * @param data An argument of packets that contains the `parse()` function or just an array of Buffers.
   */
  public send(...data: Sendable[]) {
    Peer.send(this.client.host, this.data.netID, this.data.channelID, ...data);
  }

  /**
   * Sends multiple packets to a single peer.
   * @param _client The Wrapper client.
   * @param netID The netID of a peer.
   * @param channelID The channelID of a channels.
   * @param data An argument of packets that contains the `parse()` function or just an array of Buffers.
   */
  public static send(_client: Host, netID: number, channelID: number, ...data: Sendable[]) {
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

    return _client.send(
      netID,
      Buffer.concat(packets.filter((packet): packet is Buffer => packet !== undefined)),
      channelID
    );
  }

  /**
   * Disconnects the peer.
   * @param type Type of disconnection. Defaults to `later`.
   */
  public disconnect(type: "now" | "later" | "normal" = "later") {
    switch (type) {
      case "normal": {
        this.client.host.disconnect(this.data.netID);
        break;
      }
      case "later": {
        this.client.host.disconnectLater(this.data.netID);
        break;
      }
      case "now": {
        this.client.host.disconnectNow(this.data.netID);
        break;
      }
    }
  }
}
