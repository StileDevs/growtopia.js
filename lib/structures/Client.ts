import type { ClientOptions, Sendable } from "../../types";
import EventEmitter from "eventemitter3";
import { Host } from "../../native";
import { Variant } from "../packets/Variant";

export class Client extends EventEmitter {
  public host: Host;
  public config: ClientOptions;

  constructor(options?: ClientOptions) {
    super();

    this.config = {
      enet: {
        ip: options?.enet?.ip ?? "127.0.0.1",
        port: options?.enet?.port ?? 17091,
        maxPeers: options?.enet?.maxPeers ?? 1024,
        useNewPacket: {
          asClient: options?.enet?.useNewPacket?.asClient ?? false
        },
        channelLimit: options?.enet?.channelLimit ?? 2
      }
    };

    this.host = new Host(
      this.config.enet?.ip!,
      this.config.enet?.port!,
      this.config.enet?.maxPeers!,
      this.config.enet?.channelLimit!,
      this.config.enet?.useNewPacket?.asClient!
    );
  }

  public on(event: "connect", listener: (netID: number) => void): this;
  public on(event: "raw", listener: (netID: number, channelID: number, data: Buffer) => void): this;
  public on(event: "ready", listener: () => void): this;
  public on(event: "error", listener: (error: Error, data?: Buffer) => void): this;
  public on(event: "disconnect", listener: (netID: number) => void): this;
  public on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  public send(netID: number, channelID: number, ...data: Sendable[]) {
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

    packets
      .filter((packet): packet is Buffer => packet !== undefined)
      .forEach((v) => {
        this.host.send(netID, v as Buffer, channelID);
      });

    return;
  }

  public connect(ipAddress: string, port: number) {
    return this.host.connect(ipAddress, port);
  }

  public listen() {
    try {
      this.host.setEmitter(this.emit.bind(this));

      const acceptPromise = () =>
        new Promise((resolve) => setImmediate(() => resolve(this.host.service())));

      const loop = async () => {
        while (true) await acceptPromise();
      };

      loop();
      this.emit("ready");
    } catch {
      this.emit("error", new Error("Failed to initialize ENet server"));
    }
  }
}
