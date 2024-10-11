import EventEmitter from "eventemitter3";
import type { Caching, ClientOptions, ClientType } from "../../types";
import { PacketTypes } from "../util/Constants.js";
import { parseText } from "../util/Utils.js";
import { Peer } from "./Peer.js";
import type { ActionEvent, LoginInfo, PeerData } from "../../types";
import { TankPacket } from "../packets/TankPacket.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// @ts-expect-error @types/node-gyp-build not existed
import nodegyp from "node-gyp-build";
const __dirname = dirname(fileURLToPath(import.meta.url));

const Native = nodegyp(join(__dirname, "..", "..")).Client;

export class Client extends EventEmitter {
  public _client: ClientType;
  public config: ClientOptions;
  public cache: Caching;

  constructor(options?: ClientOptions) {
    super();

    this.config = {
      enet: {
        ip: options?.enet?.ip ?? "127.0.0.1",
        port: options?.enet?.port ?? 17091,
        maxPeers: options?.enet?.maxPeers ?? 1024,
        useNewPacket: {
          asClient: options?.enet?.useNewPacket?.asClient ?? false
        }
      }
    };

    this._client = new Native(this.config.enet?.ip, this.config.enet?.port) as ClientType;

    this.cache = {
      players: new Map<number, number>()
    };
  }

  public on(event: "connect", listener: (netID: number) => void): this;
  public on(event: "raw", listener: (netID: number, data: Buffer) => void): this;
  public on<T extends PeerData>(
    event: "action",
    listener: (peer: Peer<T>, data: ActionEvent) => void
  ): this;
  public on<T extends PeerData>(
    event: "tank",
    listener: (peer: Peer<T>, data: TankPacket) => void
  ): this;
  public on<T extends PeerData>(
    event: "text",
    listener: (peer: Peer<T>, data: LoginInfo) => void
  ): this;
  public on(event: "ready", listener: () => void): this;
  public on(event: "error", listener: (error: Error, data?: Buffer) => void): this;
  public on(event: "disconnect", listener: (netID: number) => void): this;
  public on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  public send(id: number, count: number, packets: Buffer[]) {
    return this._client.send(id, count, packets);
  }

  public connect(ipAddress: string, port: number, peerID: number) {
    return this._client.connect(ipAddress, port, peerID);
  }

  public toggleNewPacket() {
    return this._client.toggleNewPacket();
  }

  private emitter(emit: (...args: any[]) => void) {
    return this._client.setEmit(emit);
  }

  public listen() {
    try {
      this._client.create(this.config?.enet?.maxPeers!, this.config?.enet?.useNewPacket?.asClient!);

      this.emitter(this.emit.bind(this));

      const acceptPromise = () =>
        new Promise((resolve) => setImmediate(() => resolve(this._client.service())));

      const loop = async () => {
        while (true) await acceptPromise();
      };

      loop();
      this._handleEvent();
      this.emit("ready");
    } catch {
      this.emit("error", new Error("Failed to initialize ENet server"));
    }
  }

  private _handleEvent() {
    this.on("connect", (netID) => {
      this.cache.players?.set(netID, netID);
    });

    this.on("disconnect", (netID) => {
      this.cache.players?.delete(netID);
    });

    this.on("raw", (netID, data) => {
      const type = data.readInt32LE();
      const peer = new Peer(this, netID);

      switch (type) {
        case PacketTypes.STR: {
          const parsed = parseText(data);

          this.emit("text", peer, parsed);
          break;
        }

        case PacketTypes.ACTION: {
          const parsed = parseText(data);
          this.emit("action", peer, parsed);
          break;
        }

        case PacketTypes.TANK: {
          if (data.length < 60) {
            this.emit("error", new Error("Received invalid tank packet"), data);
            return peer.disconnect();
          }

          const tank = TankPacket.fromBuffer(data);

          this.emit("tank", peer, tank);
          break;
        }

        default: {
          this.emit("error", new Error(`Got unknown packet type of ${type}`), data);
          break;
        }
      }
    });
  }
}
